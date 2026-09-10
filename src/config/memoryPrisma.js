import { randomUUID } from "node:crypto";
import {
  CARDAPIOS_EXEMPLO,
  CATEGORIAS_EXEMPLO,
  PRODUTOS_EXEMPLO,
} from "../seeds/demoData.js";

const agora = () => new Date();
const copiar = (valor) => (valor == null ? valor : structuredClone(valor));

const erroPrisma = (code, mensagem) => Object.assign(new Error(mensagem), { code });

const ordenar = (registros, orderBy) => {
  if (!orderBy) return registros;
  const ordens = Array.isArray(orderBy) ? orderBy : [orderBy];

  return registros.sort((a, b) => {
    for (const ordem of ordens) {
      const [campo, direcao] = Object.entries(ordem)[0];
      const comparacao = String(a[campo] ?? "").localeCompare(
        String(b[campo] ?? ""),
        "pt-BR",
        { numeric: true, sensitivity: "base" }
      );
      if (comparacao !== 0) return direcao === "desc" ? -comparacao : comparacao;
    }
    return 0;
  });
};

const paginar = (registros, { skip = 0, take } = {}) =>
  registros.slice(skip, take == null ? undefined : skip + take);

const registroBase = (dados, padroes = {}) => {
  const data = agora();
  return {
    id: randomUUID(),
    ...padroes,
    ...copiar(dados),
    createdAt: dados.createdAt ? new Date(dados.createdAt) : data,
    updatedAt: dados.updatedAt ? new Date(dados.updatedAt) : data,
  };
};

const DEMO = {
  cardapios: CARDAPIOS_EXEMPLO,
  categorias: CATEGORIAS_EXEMPLO,
  produtos: PRODUTOS_EXEMPLO,
};

export const criarPrismaEmMemoria = ({ popular = true } = {}) => {
  const dataCriacao = agora();
  const estado = {
    cardapios: popular
      ? DEMO.cardapios.map((item) => ({
          ...copiar(item),
          createdAt: dataCriacao,
          updatedAt: dataCriacao,
        }))
      : [],
    categorias: popular
      ? DEMO.categorias.map((item) => ({
          ...copiar(item),
          createdAt: dataCriacao,
          updatedAt: dataCriacao,
        }))
      : [],
    produtos: popular
      ? DEMO.produtos.map((item) => ({
          ...copiar(item),
          createdAt: dataCriacao,
          updatedAt: dataCriacao,
        }))
      : [],
    pedidos: [],
    pedidoItens: [],
  };

  const encontrar = (colecao, id) => estado[colecao].find((item) => item.id === id);
  const exigir = (colecao, id) => {
    const registro = encontrar(colecao, id);
    if (!registro) throw erroPrisma("P2025", "Registro não encontrado");
    return registro;
  };

  const incluirProduto = (produto, include) => {
    const resultado = copiar(produto);
    if (include?.categoria) {
      const categoria = copiar(encontrar("categorias", produto.categoriaId));
      const opcoes = include.categoria === true ? {} : include.categoria;
      if (categoria && opcoes.include?.cardapio) {
        categoria.cardapio = copiar(encontrar("cardapios", categoria.cardapioId));
      }
      resultado.categoria = categoria;
    }
    return resultado;
  };

  const incluirCategoria = (categoria, include) => {
    const resultado = copiar(categoria);
    if (include?.cardapio) {
      resultado.cardapio = copiar(encontrar("cardapios", categoria.cardapioId));
    }
    if (include?.produtos) {
      const opcoes = include.produtos === true ? {} : include.produtos;
      let produtos = estado.produtos.filter(
        (produto) => produto.categoriaId === categoria.id
      );
      produtos = ordenar(produtos, opcoes.orderBy);
      resultado.produtos = paginar(produtos, opcoes).map(copiar);
    }
    return resultado;
  };

  const incluirCardapio = (cardapio, include) => {
    const resultado = copiar(cardapio);
    if (include?.categorias) {
      const opcoes = include.categorias === true ? {} : include.categorias;
      let categorias = estado.categorias.filter(
        (categoria) => categoria.cardapioId === cardapio.id
      );
      categorias = ordenar(categorias, opcoes.orderBy);
      resultado.categorias = paginar(categorias, opcoes).map((categoria) =>
        incluirCategoria(categoria, opcoes.include)
      );
    }
    return resultado;
  };

  const incluirPedido = (pedido, include) => {
    const resultado = copiar(pedido);
    if (include?.itens) {
      resultado.itens = estado.pedidoItens
        .filter((item) => item.pedidoId === pedido.id)
        .sort((a, b) => a.createdAt - b.createdAt)
        .map(copiar);
    }
    return resultado;
  };

  const prisma = {
    cardapio: {
      async create({ data }) {
        const registro = registroBase(data, {
          descricao: null,
          imagemUrl: null,
          ativo: true,
        });
        estado.cardapios.push(registro);
        return copiar(registro);
      },
      async findMany(opcoes = {}) {
        let registros = estado.cardapios.filter((item) => {
          if (opcoes.where?.ativo !== undefined && item.ativo !== opcoes.where.ativo) {
            return false;
          }
          return true;
        });
        registros = ordenar(registros, opcoes.orderBy);
        return paginar(registros, opcoes).map((item) =>
          incluirCardapio(item, opcoes.include)
        );
      },
      async findUnique({ where, include }) {
        const registro = encontrar("cardapios", where.id);
        return registro ? incluirCardapio(registro, include) : null;
      },
      async update({ where, data }) {
        const registro = exigir("cardapios", where.id);
        Object.assign(registro, copiar(data), { updatedAt: agora() });
        return copiar(registro);
      },
      async delete({ where }) {
        const registro = exigir("cardapios", where.id);
        if (estado.categorias.some((item) => item.cardapioId === where.id)) {
          throw erroPrisma("P2003", "Cardápio possui categorias");
        }
        estado.cardapios.splice(estado.cardapios.indexOf(registro), 1);
        return copiar(registro);
      },
      async count({ where } = {}) {
        return (await this.findMany({ where })).length;
      },
    },
    categoria: {
      async create({ data }) {
        if (!encontrar("cardapios", data.cardapioId)) {
          throw erroPrisma("P2003", "Cardápio não encontrado");
        }
        const registro = registroBase(data);
        estado.categorias.push(registro);
        return copiar(registro);
      },
      async findMany(opcoes = {}) {
        let registros = estado.categorias.filter((item) => {
          if (opcoes.where?.cardapioId && item.cardapioId !== opcoes.where.cardapioId) {
            return false;
          }
          if (opcoes.where?.cardapio?.ativo !== undefined) {
            const cardapio = encontrar("cardapios", item.cardapioId);
            if (cardapio?.ativo !== opcoes.where.cardapio.ativo) return false;
          }
          return true;
        });
        registros = ordenar(registros, opcoes.orderBy);
        return paginar(registros, opcoes).map((item) =>
          incluirCategoria(item, opcoes.include)
        );
      },
      async findUnique({ where, include }) {
        const registro = encontrar("categorias", where.id);
        return registro ? incluirCategoria(registro, include) : null;
      },
      async update({ where, data }) {
        const registro = exigir("categorias", where.id);
        if (data.cardapioId && !encontrar("cardapios", data.cardapioId)) {
          throw erroPrisma("P2003", "Cardápio não encontrado");
        }
        Object.assign(registro, copiar(data), { updatedAt: agora() });
        return copiar(registro);
      },
      async delete({ where }) {
        const registro = exigir("categorias", where.id);
        if (estado.produtos.some((item) => item.categoriaId === where.id)) {
          throw erroPrisma("P2003", "Categoria possui produtos");
        }
        estado.categorias.splice(estado.categorias.indexOf(registro), 1);
        return copiar(registro);
      },
      async count({ where } = {}) {
        return (await this.findMany({ where })).length;
      },
    },
    produto: {
      async create({ data }) {
        if (!encontrar("categorias", data.categoriaId)) {
          throw erroPrisma("P2003", "Categoria não encontrada");
        }
        const registro = registroBase(data, {
          descricao: null,
          imagemUrl: null,
          disponivel: true,
        });
        estado.produtos.push(registro);
        return copiar(registro);
      },
      async findMany(opcoes = {}) {
        let registros = estado.produtos.filter((item) => {
          const where = opcoes.where || {};
          if (where.id?.in && !where.id.in.includes(item.id)) return false;
          if (where.categoriaId && item.categoriaId !== where.categoriaId) return false;
          if (where.disponivel !== undefined && item.disponivel !== where.disponivel) {
            return false;
          }
          if (where.nome?.contains) {
            return item.nome
              .toLocaleLowerCase("pt-BR")
              .includes(String(where.nome.contains).toLocaleLowerCase("pt-BR"));
          }
          if (where.categoria?.cardapio?.ativo !== undefined) {
            const categoria = encontrar("categorias", item.categoriaId);
            const cardapio = categoria
              ? encontrar("cardapios", categoria.cardapioId)
              : null;
            if (cardapio?.ativo !== where.categoria.cardapio.ativo) return false;
          }
          return true;
        });
        registros = ordenar(registros, opcoes.orderBy);
        return paginar(registros, opcoes).map((item) =>
          incluirProduto(item, opcoes.include)
        );
      },
      async findUnique({ where, include }) {
        const registro = encontrar("produtos", where.id);
        return registro ? incluirProduto(registro, include) : null;
      },
      async update({ where, data }) {
        const registro = exigir("produtos", where.id);
        if (data.categoriaId && !encontrar("categorias", data.categoriaId)) {
          throw erroPrisma("P2003", "Categoria não encontrada");
        }
        Object.assign(registro, copiar(data), { updatedAt: agora() });
        return copiar(registro);
      },
      async delete({ where }) {
        const registro = exigir("produtos", where.id);
        estado.produtos.splice(estado.produtos.indexOf(registro), 1);
        return copiar(registro);
      },
      async count({ where } = {}) {
        return (await this.findMany({ where })).length;
      },
    },
    pedido: {
      async create({ data, include }) {
        if (!encontrar("cardapios", data.cardapioId)) {
          throw erroPrisma("P2003", "Cardápio não encontrado");
        }
        if (
          estado.pedidos.some(
            (item) => item.chaveIdempotencia === data.chaveIdempotencia
          )
        ) {
          throw erroPrisma("P2002", "Pedido duplicado");
        }
        const { itens, ...dadosPedido } = copiar(data);
        const pedido = registroBase(dadosPedido, { status: "RECEBIDO" });
        estado.pedidos.push(pedido);
        for (const item of itens?.create || []) {
          estado.pedidoItens.push(
            registroBase({ ...item, pedidoId: pedido.id })
          );
        }
        return incluirPedido(pedido, include);
      },
      async findMany(opcoes = {}) {
        let registros = estado.pedidos.filter((item) => {
          if (opcoes.where?.status && item.status !== opcoes.where.status) return false;
          return true;
        });
        registros = ordenar(registros, opcoes.orderBy);
        return paginar(registros, opcoes).map((item) =>
          incluirPedido(item, opcoes.include)
        );
      },
      async findUnique({ where, include }) {
        const registro = where.id
          ? encontrar("pedidos", where.id)
          : estado.pedidos.find(
              (item) => item.chaveIdempotencia === where.chaveIdempotencia
            );
        return registro ? incluirPedido(registro, include) : null;
      },
      async update({ where, data, include }) {
        const registro = exigir("pedidos", where.id);
        Object.assign(registro, copiar(data), { updatedAt: agora() });
        return incluirPedido(registro, include);
      },
      async count({ where } = {}) {
        return (await this.findMany({ where })).length;
      },
    },
    async $connect() {},
    async $disconnect() {},
    async $queryRawUnsafe() {
      return [{ result: 1 }];
    },
    async $transaction(operacao) {
      const snapshot = copiar(estado);
      try {
        return await operacao(prisma);
      } catch (erro) {
        for (const chave of Object.keys(estado)) {
          estado[chave] = snapshot[chave];
        }
        throw erro;
      }
    },
  };

  return prisma;
};
