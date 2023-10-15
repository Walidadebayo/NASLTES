const Model = require('./model');
const { query } = require('./connection');

class Student extends Model {
    static async findByTicketNo(ticket_no) {
        let sql = `SELECT * FROM ${this.tableName} WHERE ticket_no = ?`
        let results = await query(sql, `${ticket_no}`);
        if (results.length > 0) {
            let row = results[0]
            return new this(row)
        }
        return null
    }

    static async ticketNoExists(ticket_no){
        return (await this.findByTicketNo(ticket_no)) != null
    }
    static async FindByTxRef(tx_ref){
        let sql = `SELECT * FROM ${this.tableName} WHERE tx_ref = ?`
        let results = await query(sql, `${tx_ref}`);
        if (results.length > 0) {
            let row = results[0]
            return new this(row)
        }
        return null
    }
    static async txRefExists(tx_ref){
        return (await this.FindByTxRef(tx_ref)) != null
    }
}
module.exports = Student
