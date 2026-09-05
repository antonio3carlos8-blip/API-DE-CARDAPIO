import { BaseRepository } from "./baseRepository.js";
import prisma from "../config/prisma.js";

class CategoriaRepository extends BaseRepository {
  constructor() {
    super(prisma.categoria);
  }
}

export default new CategoriaRepository();