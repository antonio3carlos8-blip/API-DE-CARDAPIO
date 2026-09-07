import prisma from "../config/prisma.js";

// IDs fixos para o seed ser idempotente: rodar de novo atualiza
// os registros em vez de duplicar, e nada é apagado do banco.
const CARDAPIO_ID = "a0000000-0000-4000-8000-000000000001";

const categorias = [
  { id: "b0000000-0000-4000-8000-000000000001", nome: "Hambúrgueres" },
  { id: "b0000000-0000-4000-8000-000000000002", nome: "Porções" },
  { id: "b0000000-0000-4000-8000-000000000003", nome: "Bebidas" },
  { id: "b0000000-0000-4000-8000-000000000004", nome: "Sobremesas" },
];

const produtos = [
  {
    id: "c0000000-0000-4000-8000-000000000001",
    nome: "X-Salada",
    descricao: "Pão, hambúrguer 150g, queijo, alface, tomate e maionese da casa",
    preco: "24.90",
    categoriaId: categorias[0].id,
  },
  {
    id: "c0000000-0000-4000-8000-000000000002",
    nome: "X-Bacon",
    descricao: "Pão, hambúrguer 150g, queijo cheddar, bacon crocante e cebola",
    preco: "29.90",
    categoriaId: categorias[0].id,
  },
  {
    id: "c0000000-0000-4000-8000-000000000003",
    nome: "X-Tudo",
    descricao: "Dois hambúrgueres, ovo, bacon, presunto, queijo e salada",
    preco: "36.50",
    categoriaId: categorias[0].id,
  },
  {
    id: "c0000000-0000-4000-8000-000000000004",
    nome: "Burger Vegetariano",
    descricao: "Hambúrguer de grão-de-bico, queijo branco e rúcula",
    preco: "27.00",
    categoriaId: categorias[0].id,
  },
  {
    id: "c0000000-0000-4000-8000-000000000005",
    nome: "Batata Frita",
    descricao: "Porção individual com 300g",
    preco: "18.00",
    categoriaId: categorias[1].id,
  },
  {
    id: "c0000000-0000-4000-8000-000000000006",
    nome: "Batata com Cheddar e Bacon",
    descricao: "Porção com 400g, cheddar cremoso e bacon",
    preco: "26.00",
    categoriaId: categorias[1].id,
  },
  {
    id: "c0000000-0000-4000-8000-000000000007",
    nome: "Onion Rings",
    descricao: "10 unidades com molho barbecue",
    preco: "22.00",
    disponivel: false,
    categoriaId: categorias[1].id,
  },
  {
    id: "c0000000-0000-4000-8000-000000000008",
    nome: "Coca-Cola Lata",
    descricao: "350ml",
    preco: "7.00",
    categoriaId: categorias[2].id,
  },
  {
    id: "c0000000-0000-4000-8000-000000000009",
    nome: "Suco de Laranja",
    descricao: "Natural, 500ml",
    preco: "12.00",
    categoriaId: categorias[2].id,
  },
  {
    id: "c0000000-0000-4000-8000-00000000000a",
    nome: "Água Mineral",
    descricao: "500ml, com ou sem gás",
    preco: "5.00",
    categoriaId: categorias[2].id,
  },
  {
    id: "c0000000-0000-4000-8000-00000000000b",
    nome: "Milkshake de Chocolate",
    descricao: "400ml com calda e chantilly",
    preco: "19.90",
    categoriaId: categorias[3].id,
  },
  {
    id: "c0000000-0000-4000-8000-00000000000c",
    nome: "Petit Gateau",
    descricao: "Bolo de chocolate com sorvete de creme",
    preco: "23.00",
    categoriaId: categorias[3].id,
  },
];

async function main() {
  console.log("Populando o banco...");

  const cardapio = await prisma.cardapio.upsert({
    where: { id: CARDAPIO_ID },
    update: {},
    create: {
      id: CARDAPIO_ID,
      nome: "Cardápio Principal",
      descricao: "Cardápio da hamburgueria",
    },
  });
  console.log(`  cardápio: ${cardapio.nome}`);

  for (const categoria of categorias) {
    await prisma.categoria.upsert({
      where: { id: categoria.id },
      update: { nome: categoria.nome },
      create: { ...categoria, cardapioId: CARDAPIO_ID },
    });
  }
  console.log(`  ${categorias.length} categorias`);

  for (const produto of produtos) {
    await prisma.produto.upsert({
      where: { id: produto.id },
      update: produto,
      create: produto,
    });
  }
  console.log(`  ${produtos.length} produtos`);

  console.log("Pronto.");
}

main()
  .catch((erro) => {
    console.error("Erro ao popular o banco:", erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
