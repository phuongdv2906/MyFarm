/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function ScheduleDatabase() {
    var self = this;
    self.DbCommon = new DBAccess();
    self.Db = self.DbCommon.getDB();
}
ScheduleDatabase.prototype.getAllTargets = function (_callback) {
    var self = this;
    self.Db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM ' + TBL_TARGET.name, [], function (tx, results) {
            _callback(results);
        }, null);
    });
};
ScheduleDatabase.prototype.getAllFood = function (_callback) {
    var self = this;
    var strQuery = 'SELECT * FROM ' + TBL_FOOD.name;
    self.Db.transaction(function (tx) {
        tx.executeSql(strQuery, [], function (tx, results) {
            _callback(results);
        }, null);
    });
};
ScheduleDatabase.prototype.getSchedules = function (_callback) {
    var self = this;
    var strQuery = "SELECT * "
            + " FROM " + TBL_SCHEDULE.name + ' inner join ('
            + TBL_COST.name + ' left join ' + TBL_OTHER_COST.name
            + ' on ' + TBL_COST.colums.targetId + '=' + TBL_OTHER_COST.colums.id + ' '
            + ' left join ' + TBL_FOOD.name + ' on '
            + TBL_COST.colums.targetId + '=' + TBL_FOOD.colums.id + ') on '
            + TBL_SCHEDULE.colums.costId + '=' + TBL_COST.colums.id
            + ' ORDER BY ' + TBL_SCHEDULE.colums.date + ' DESC';
    self.Db.transaction(function (tx) {
        var lstItem = new Array();
        tx.executeSql(strQuery, [], function (tx, results) {
            var len = results.rows.length, i;
            for (i = 0; i < len; i++) {
                var item = results.rows[i];
                $.each(Object.keys(item), function (i, key) {
                    if (item[key] === null)
                        item[key] = '';
                });
                lstItem.push(item);
            }
            _callback(lstItem);
        }, null);
    });
};
ScheduleDatabase.prototype.save = function (mode, item, _callback) {
    var self = this;
    var costItem = {};
    var scheduleItem = {};
    var otherCostItem = {};
    if (mode === 'ADD') {
        if (item[TBL_COST.colums.type] === '1') {
            otherCostItem[TBL_OTHER_COST.colums.id] = Com.getGenerateId('OC');
        }
        costItem[TBL_COST.colums.id] = Com.getGenerateId('C');
        scheduleItem[TBL_SCHEDULE.colums.id] = parseInt(Com.getGenerateId(''));
    } else if (mode === 'EDIT') {
        // cost item
        costItem[TBL_COST.colums.id] = item[TBL_COST.colums.id];
        // other cost
        if (item[TBL_COST.colums.type] === '1') {
            otherCostItem[TBL_OTHER_COST.colums.id] = item[TBL_OTHER_COST.colums.id];
        }
        // schedule item
        scheduleItem[TBL_SCHEDULE.colums.id] = item[TBL_SCHEDULE.colums.id];
    }

    // cost item
    costItem[TBL_COST.colums.type] = item[TBL_COST.colums.type];
    if (item[TBL_COST.colums.type] === '0') {
        costItem[TBL_COST.colums.targetId] = item[TBL_FOOD.colums.id];
    } else {
        costItem[TBL_COST.colums.targetId] = otherCostItem[TBL_OTHER_COST.colums.id];
    }
    costItem[TBL_COST.colums.quanlity] = item[TBL_COST.colums.quanlity];
    // other cost item
    if (item[TBL_COST.colums.type] === '1') {
        otherCostItem[TBL_OTHER_COST.colums.price] = item[TBL_OTHER_COST.colums.price];
    }
    // schedule item
    scheduleItem[TBL_SCHEDULE.colums.date] = item[TBL_SCHEDULE.colums.date];
    scheduleItem[TBL_SCHEDULE.colums.targetId] = item[TBL_TARGET.colums.id];
    scheduleItem[TBL_SCHEDULE.colums.costId] = costItem[TBL_COST.colums.id];
    scheduleItem[TBL_SCHEDULE.colums.content] = item[TBL_SCHEDULE.colums.content];
    // save data
    if (mode === 'ADD') {
        var _callbackAdd = function () {
            self.DbCommon.insert(TBL_COST.name, costItem, function () {
                self.DbCommon.insert(TBL_SCHEDULE.name, scheduleItem, _callback);
            });
        };
        if (costItem[TBL_COST.colums.type] === '1') {
            self.DbCommon.insert(TBL_OTHER_COST.name, otherCostItem, _callbackAdd);
        } else {
            _callbackAdd();
        }
    } else if (mode === 'EDIT') {
        var _callbackEdit = function () {
            self.DbCommon.update(TBL_COST.name, costItem, function () {
                self.DbCommon.update(TBL_SCHEDULE.name, scheduleItem, _callback);
            });
        };
        if (costItem[TBL_COST.colums.type] === '1') {
            self.DbCommon.update(TBL_OTHER_COST.name, otherCostItem, _callbackEdit);
        } else {
            self.DbCommon.delete(TBL_OTHER_COST.name, otherCostItem, _callbackEdit());
        }
    }
};
ScheduleDatabase.prototype.delete = function (item, _callback) {
    var self = this;
    var costItem = {};
    var scheduleItem = {};
    var otherCostItem = {};
    // cost item
    costItem[TBL_COST.colums.id] = item[TBL_COST.colums.id];
    // other cost
    if (item[TBL_COST.colums.type] === '1') {
        otherCostItem[TBL_OTHER_COST.colums.id] = item[TBL_OTHER_COST.colums.id];
    }
    // schedule item
    scheduleItem[TBL_SCHEDULE.colums.id] = item[TBL_SCHEDULE.colums.id];

    // cost item
    costItem[TBL_COST.colums.type] = item[TBL_COST.colums.type];
    if (item[TBL_COST.colums.type] === '0') {
        costItem[TBL_COST.colums.targetId] = item[TBL_FOOD.colums.id];
    } else {
        costItem[TBL_COST.colums.targetId] = otherCostItem[TBL_OTHER_COST.colums.id];
    }
    costItem[TBL_COST.colums.quanlity] = item[TBL_COST.colums.quanlity];
    // other cost item
    if (item[TBL_COST.colums.type] === '1') {
        otherCostItem[TBL_OTHER_COST.colums.price] = item[TBL_OTHER_COST.colums.price];
    }
    // schedule item
    scheduleItem[TBL_SCHEDULE.colums.date] = item[TBL_SCHEDULE.colums.date];
    scheduleItem[TBL_SCHEDULE.colums.targetId] = item[TBL_TARGET.colums.id];
    scheduleItem[TBL_SCHEDULE.colums.costId] = costItem[TBL_COST.colums.id];
    scheduleItem[TBL_SCHEDULE.colums.content] = item[TBL_SCHEDULE.colums.content];
    
    // delete item
    var _callbackDel = function(){
        self.DbCommon.delete(TBL_COST.name, costItem, function(){
            self.DbCommon.delete(TBL_SCHEDULE.name, scheduleItem, function(){
                _callback();
            });
        });
    };
    if(costItem[TBL_COST.colums.type] === '1'){
        self.DbCommon.delete(TBL_OTHER_COST.name, otherCostItem, function(){
            _callbackDel();
        });
    }else{
        _callbackDel();
    }
    
};



