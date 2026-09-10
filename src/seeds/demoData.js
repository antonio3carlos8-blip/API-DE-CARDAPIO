export const CARDAPIOS_EXEMPLO = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    nome: "Cardápio da Casa",
    descricao: "Lanches artesanais, porções, bebidas e sobremesas.",
    imagemUrl:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
    ativo: true,
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    nome: "Pizzas da Noite",
    descricao: "Uma seleção curta de pizzas para compartilhar.",
    imagemUrl:
      "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=1200&q=80",
    ativo: true,
  },
];

export const CATEGORIAS_EXEMPLO = [
  {
    id: "b0000000-0000-4000-8000-000000000001",
    nome: "Hambúrgueres",
    cardapioId: CARDAPIOS_EXEMPLO[0].id,
  },
  {
    id: "b0000000-0000-4000-8000-000000000002",
    nome: "Porções",
    cardapioId: CARDAPIOS_EXEMPLO[0].id,
  },
  {
    id: "b0000000-0000-4000-8000-000000000003",
    nome: "Bebidas",
    cardapioId: CARDAPIOS_EXEMPLO[0].id,
  },
  {
    id: "b0000000-0000-4000-8000-000000000004",
    nome: "Sobremesas",
    cardapioId: CARDAPIOS_EXEMPLO[0].id,
  },
  {
    id: "b0000000-0000-4000-8000-000000000005",
    nome: "Pizzas clássicas",
    cardapioId: CARDAPIOS_EXEMPLO[1].id,
  },
  {
    id: "b0000000-0000-4000-8000-000000000006",
    nome: "Pizzas especiais",
    cardapioId: CARDAPIOS_EXEMPLO[1].id,
  },
];

export const PRODUTOS_EXEMPLO = [
  {
    id: "c0000000-0000-4000-8000-000000000001",
    nome: "X-Salada",
    descricao: "Pão, hambúrguer 150g, queijo, alface, tomate e maionese da casa",
    preco: 24.9,
    imagemUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    disponivel: true,
    categoriaId: CATEGORIAS_EXEMPLO[0].id,
  },
  {
    id: "c0000000-0000-4000-8000-000000000002",
    nome: "X-Bacon",
    descricao: "Pão, hambúrguer 150g, queijo cheddar, bacon crocante e cebola",
    preco: 29.9,
    imagemUrl:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80",
    disponivel: true,
    categoriaId: CATEGORIAS_EXEMPLO[0].id,
  },
  {
    id: "c0000000-0000-4000-8000-000000000003",
    nome: "X-Tudo",
    descricao: "Dois hambúrgueres, ovo, bacon, presunto, queijo e salada",
    preco: 36.5,
    imagemUrl:
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=900&q=80",
    disponivel: true,
    categoriaId: CATEGORIAS_EXEMPLO[0].id,
  },
  {
    id: "c0000000-0000-4000-8000-000000000004",
    nome: "Burger Vegetariano",
    descricao: "Hambúrguer de grão-de-bico, queijo branco e rúcula",
    preco: 27,
    imagemUrl:
      "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=900&q=80",
    disponivel: true,
    categoriaId: CATEGORIAS_EXEMPLO[0].id,
  },
  {
    id: "c0000000-0000-4000-8000-000000000005",
    nome: "Batata Frita",
    descricao: "Porção individual com 300g",
    preco: 18,
    imagemUrl:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80",
    disponivel: true,
    categoriaId: CATEGORIAS_EXEMPLO[1].id,
  },
  {
    id: "c0000000-0000-4000-8000-000000000006",
    nome: "Batata com Cheddar e Bacon",
    descricao: "Porção com 400g, cheddar cremoso e bacon",
    preco: 26,
    imagemUrl:
      "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=900&q=80",
    disponivel: true,
    categoriaId: CATEGORIAS_EXEMPLO[1].id,
  },
  {
    id: "c0000000-0000-4000-8000-000000000007",
    nome: "Onion Rings",
    descricao: "10 unidades com molho barbecue",
    preco: 22,
    imagemUrl:
      "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=900&q=80",
    disponivel: false,
    categoriaId: CATEGORIAS_EXEMPLO[1].id,
  },
  {
    id: "c0000000-0000-4000-8000-000000000008",
    nome: "Coca-Cola Lata",
    descricao: "350ml",
    preco: 7,
    imagemUrl:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=80",
    disponivel: true,
    categoriaId: CATEGORIAS_EXEMPLO[2].id,
  },
  {
    id: "c0000000-0000-4000-8000-000000000009",
    nome: "Suco de Laranja",
    descricao: "Natural, 500ml",
    preco: 12,
    imagemUrl:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=80",
    disponivel: true,
    categoriaId: CATEGORIAS_EXEMPLO[2].id,
  },
  {
    id: "c0000000-0000-4000-8000-00000000000a",
    nome: "Água Mineral",
    descricao: "500ml, com ou sem gás",
    preco: 5,
    imagemUrl:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=900&q=80",
    disponivel: true,
    categoriaId: CATEGORIAS_EXEMPLO[2].id,
  },
  {
    id: "c0000000-0000-4000-8000-00000000000b",
    nome: "Milkshake de Chocolate",
    descricao: "400ml com calda e chantilly",
    preco: 19.9,
    imagemUrl:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80",
    disponivel: true,
    categoriaId: CATEGORIAS_EXEMPLO[3].id,
  },
  {
    id: "c0000000-0000-4000-8000-00000000000c",
    nome: "Petit Gateau",
    descricao: "Bolo de chocolate com sorvete de creme",
    preco: 23,
    imagemUrl:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80",
    disponivel: true,
    categoriaId: CATEGORIAS_EXEMPLO[3].id,
  },
  {
    id: "c0000000-0000-4000-8000-00000000000d",
    nome: "Pizza Margherita",
    descricao: "Molho de tomate, muçarela, tomate e manjericão",
    preco: 42.9,
    imagemUrl:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80",
    disponivel: true,
    categoriaId: CATEGORIAS_EXEMPLO[4].id,
  },
  {
    id: "c0000000-0000-4000-8000-00000000000e",
    nome: "Pizza Calabresa",
    descricao: "Molho de tomate, muçarela, calabresa e cebola roxa",
    preco: 46.9,
    imagemUrl:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
    disponivel: true,
    categoriaId: CATEGORIAS_EXEMPLO[4].id,
  },
  {
    id: "c0000000-0000-4000-8000-00000000000f",
    nome: "Pizza Burrata",
    descricao: "Molho de tomate, burrata cremosa e folhas frescas",
    preco: 39.9,
    imagemUrl:
      "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=900&q=80",
    disponivel: true,
    categoriaId: CATEGORIAS_EXEMPLO[5].id,
  },
];
