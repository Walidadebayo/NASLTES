const Model = require('./model');
const { query } = require('./connection');

class Ticket extends Model {
    get tab(){
        return this.table[0] || ''
    }
    get table(){
        return JSON.parse(this.tables)
    }
}
module.exports = Ticket