import File from '../models/File';

class FileController {
  async store(req, res) {
    // originalname/filename -> Nomes que vem no arquivo
    // name/path -> nome das colunas na tabela de files
    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path,
    });

    return res.json(file);
  }
}

export default new FileController();
