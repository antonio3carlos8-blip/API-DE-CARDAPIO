class BaseRepository {
  constructor(modelo) {
    this.modelo = modelo;
  }


  async criar(dados) {
    return this.modelo.create({
      data: dados,
    });
  }


  async listar(opcoes = {}) {
    return this.modelo.findMany(opcoes);
  }


  async buscarPorId(id, opcoes = {}) {
    return this.modelo.findUnique({
      where: { id },
      ...opcoes,
    });
  }


  async atualizar(id, dados) {
    return this.modelo.update({
      where: { id },
      data: dados,
    });
  }

  
  async excluir(id) {
    return this.modelo.delete({
      where: { id },
    });
  }
}

export default BaseRepository;