/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function StatisticDb() {
    var self = this;
    self.DbCommon = new DBAccess();
    self.Db = self.DbCommon.getDB();
}
StatisticDb.prototype.getTotalFood = function (targetId, startDate, endDate, _callback) {
    var self = this;
    var strQuery = 'SELECT ' + TBL_FOOD.colums.id + ',' + TBL_FOOD.colums.name + ','
            + ' SUM(' + TBL_COST.colums.quanlity + ') AS ' + TBL_COST.colums.quanlity + ','
            + ' SUM(' + TBL_FOOD_HISTORY.colums.price + ' * '
            + TBL_COST.colums.quanlity + ') AS ' + TBL_SELECT.totalFood
            + ' FROM ' + TBL_SCHEDULE.name + ' inner join ('
            + TBL_COST.name + ' inner join (' + TBL_FOOD_HISTORY.name + ' inner join ' + TBL_FOOD.name + ' on '
            + TBL_FOOD_HISTORY.colums.foodId + '=' + TBL_FOOD.colums.id + ') on '
            + TBL_COST.colums.targetId + '=' + TBL_FOOD.colums.id + ') on '
            + TBL_SCHEDULE.colums.costId + '=' + TBL_COST.colums.id
            + ' WHERE ' + TBL_SCHEDULE.colums.targetId + '=' + "'" + targetId + "'" + ' AND '
            + TBL_SCHEDULE.colums.date + '>=' + startDate + ' AND '
            + TBL_SCHEDULE.colums.date + '<=' + endDate + ' AND '
            + TBL_SCHEDULE.colums.date + '>' + TBL_FOOD_HISTORY.colums.startApply + ' AND '
            + TBL_SCHEDULE.colums.date + '<=' + TBL_FOOD_HISTORY.colums.endApply
            + ' GROUP BY ' + TBL_FOOD.colums.id
            + ' ORDER BY ' + TBL_SCHEDULE.colums.date + ' DESC';
    self.Db.transaction(function (tx) {
        tx.executeSql(strQuery, [], function (tx, results) {
            _callback(results);
        }, null);
    });
};
StatisticDb.prototype.getTotalOther = function (targetId, startDate, endDate, _callback) {
    var self = this;
    var testQuery = 'SELECT '
            + TBL_SCHEDULE.colums.content + ',' + TBL_OTHER_COST.colums.price
            + ' FROM ' + TBL_SCHEDULE.name
            + ' inner join ' + TBL_COST.name + ' on ' + TBL_SCHEDULE.colums.costId + '=' + TBL_COST.colums.id
            + ', ' + TBL_OTHER_COST.name
            + ' WHERE ' + TBL_SCHEDULE.colums.targetId + '=' + "'" + targetId + "'" + ' AND '
            + TBL_OTHER_COST.colums.id + '=' + TBL_COST.colums.targetId + ' AND '
            + TBL_SCHEDULE.colums.date + '>=' + startDate + ' AND '
            + TBL_SCHEDULE.colums.date + '<=' + endDate + ' AND '
            + TBL_COST.colums.type + "='1'"
            + ' ORDER BY ' + TBL_SCHEDULE.colums.date + ' DESC';
    self.Db.transaction(function (tx) {
        tx.executeSql(testQuery, [], function (tx, results) {
            var x = '';
            _callback(results);
        }, null);
    });
};
StatisticDb.prototype.getAllTargets = function (_callback) {
    var self = this;
    self.Db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM ' + TBL_TARGET.name, [], function (tx, results) {
            _callback(results);
        }, null);
    });
};


