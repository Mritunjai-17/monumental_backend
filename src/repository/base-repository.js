export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async getAll(filter = {}, sort = { createdAt: -1 }) {
    if (!this.model) return [];
    return await this.model.find(filter).sort(sort);
  }

  async getById(id) {
    if (!this.model) return null;
    return await this.model.findById(id);
  }

  async findOne(filter = {}) {
    if (!this.model) return null;
    return await this.model.findOne(filter);
  }

  async create(data) {
    if (!this.model) return data;
    return await this.model.create(data);
  }

  async updateById(id, updateData) {
    if (!this.model) return null;
    return await this.model.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async deleteById(id) {
    if (!this.model) return null;
    return await this.model.findByIdAndDelete(id);
  }

  async count(filter = {}) {
    if (!this.model) return 0;
    return await this.model.countDocuments(filter);
  }
}

