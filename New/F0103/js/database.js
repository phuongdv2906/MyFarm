/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function FoodDb() {
    var self = this;
    self.DbCommon = new DBAccess();
    self.Db = self.DbCommon.getDB();
}
FoodDb.prototype.saveFood = function (mode, Fitem, _callback) {
    var self = this;
    if (mode === 'ADD') {
        self.DbCommon.insert(TBL_FOOD.name, Fitem, _callback);
    } else if (mode === 'EDIT') {
        self.DbCommon.update(TBL_FOOD.name, Fitem, _callback);
    }
};

FoodDb.prototype.insertFoodHistory = function (item, _callback) {
    var self = this;
    var sqlQuery = 'SELECT * FROM ' + TBL_FOOD_HISTORY.name
            + ' WHERE ' + TBL_FOOD_HISTORY.colums.foodId + '=' + "'"
            + item[TBL_FOOD_HISTORY.colums.foodId] + "'"
            + ' ORDER BY ' + TBL_FOOD_HISTORY.colums.startApply + ' DESC ';
    self.Db.transaction(function (tx) {
        tx.executeSql(sqlQuery, [], function (tx, results) {
            if(results.rows.length > 0){
                var nitem = results.rows[0];
                nitem[TBL_FOOD_HISTORY.colums.endApply] = item[TBL_FOOD_HISTORY.colums.startApply];
                self.DbCommon.update(TBL_FOOD_HISTORY.name,nitem, function(){
                    self.DbCommon.insert(TBL_FOOD_HISTORY.name, item, _callback);
                });
            }
            else{
                self.DbCommon.insert(TBL_FOOD_HISTORY.name, item, _callback);
            }
        }, null);
    });
};

FoodDb.prototype.delete = function (itemKey, _callback) {
    var self = this;
    self.DbCommon.delete(TBL_FOOD.name, itemKey, _callback);
};

FoodDb.prototype.getAllFood = function (_callback) {
    var self = this;
    var strQuery = 'SELECT * FROM ' + TBL_FOOD.name + ',' + TBL_FOOD_HISTORY.name + ' WHERE '
            + TBL_FOOD.colums.id + '=' + TBL_FOOD_HISTORY.colums.foodId
            + ' order by ' + TBL_FOOD_HISTORY.colums.foodId + ',' + TBL_FOOD_HISTORY.colums.startApply + ' DESC ';
    self.Db.transaction(function (tx) {
        tx.executeSql(strQuery, [], function (tx, results) {
            _callback(results);
        }, null);
    });
};
FoodDb.prototype.deleteHistoryByFoodId = function (foodId, _callback) {
    var self = this;
    var strQuery = 'DELETE FROM ' + TBL_FOOD_HISTORY.name + ' WHERE '
            + TBL_FOOD_HISTORY.colums.foodId + '=?';
    var lstInput = new Array();
    lstInput.push(foodId);
    self.Db.transaction(function (tx) {
        tx.executeSql(strQuery, lstInput);
        _callback();
    });
};
