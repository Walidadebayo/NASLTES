const Model = require('./model');
const { query } = require('./connection');

class Admin extends Model {
    static async findByEmail(email){
        let sql = `SELECT * FROM ${this.tableName} WHERE email = ?`
        let results = await query(sql, `${email}`);
        if (results.length > 0) {
            let row = results[0]
            return new this(row)
        }
        return null;
    }
    static async findByPhone(phone) {
        let sql = `SELECT * FROM ${this.tableName} WHERE phone = ?`
        let results = await query(sql, `${phone}`);
        if (results.length > 0) {
            let row = results[0]
            return new this(row)
        }
        return null
    }
    get name(){
        return `${this.first_name} ${this.last_name}`;
    }
}
module.exports = Admin
