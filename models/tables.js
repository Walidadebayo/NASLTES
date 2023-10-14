const Model = require('./model');
const { query } = require('./connection');

class Table extends Model {
    static async findByName(name) {
        let sql = `SELECT * FROM ${this.tableName} WHERE name = ?`
        let results = await query(sql, `${name}`);
        if (results.length > 0) {
            let row = results[0]
            return new this(row)
        }
        return null
    }
}
module.exports = Table