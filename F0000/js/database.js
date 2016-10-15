/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function DBAccess() {
    var self = this;
    self.hasDb = false;
    self.init();
}
DBAccess.prototype.init = function () {
    var self = this;
    self.Db = window.openDatabase('mydb', '1.0', 'my first database', 100 * 1024 * 1024);
    self.Db.transaction(function (tx) {
        // create 
        tx.executeSql('CREATE TABLE IF NOT EXISTS ' + TBL_TARGET.name + '('
                + TBL_TARGET.colums.id + ' unique,'
                + TBL_TARGET.colums.name + ','
                + TBL_TARGET.colums.area + ','
                + TBL_TARGET.colums.status + ','
                + TBL_TARGET.colums.content + ')');
        // create 
        tx.executeSql('CREATE TABLE IF NOT EXISTS ' + TBL_FOOD.name + '('
                + TBL_FOOD.colums.id + ' unique,'
                + TBL_FOOD.colums.name + ','
                + TBL_FOOD.colums.weight + ','
                + TBL_FOOD.colums.content + ')');
        // create 
        tx.executeSql('CREATE TABLE IF NOT EXISTS ' + TBL_FOOD_HISTORY.name + '('
                + TBL_FOOD_HISTORY.colums.id + ' unique,'
                + TBL_FOOD_HISTORY.colums.foodId + ','
                + TBL_FOOD_HISTORY.colums.startApply + ','
                + TBL_FOOD_HISTORY.colums.endApply + ','
                + TBL_FOOD_HISTORY.colums.price + ')');
        // create 
        tx.executeSql('CREATE TABLE IF NOT EXISTS ' + TBL_SCHEDULE.name + '('
                + TBL_SCHEDULE.colums.id + ' unique,'
                + TBL_SCHEDULE.colums.date + ','
                + TBL_SCHEDULE.colums.targetId + ','
                + TBL_SCHEDULE.colums.costId + ','
                + TBL_SCHEDULE.colums.content + ')');
        // create 
        tx.executeSql('CREATE TABLE IF NOT EXISTS ' + TBL_COST.name + '('
                + TBL_COST.colums.id + ' unique,'
                + TBL_COST.colums.type + ','
                + TBL_COST.colums.targetId + ','
                + TBL_COST.colums.quanlity + ')');
        // create 
        tx.executeSql('CREATE TABLE IF NOT EXISTS ' + TBL_OTHER_COST.name + '('
                + TBL_OTHER_COST.colums.id + ' unique,'
                + TBL_OTHER_COST.colums.price + ')');
        // create 
        tx.executeSql('CREATE TABLE IF NOT EXISTS ' + TBL_REVENUE.name + '('
                + TBL_REVENUE.colums.id + ' unique,'
                + TBL_REVENUE.colums.date + ','
                + TBL_REVENUE.colums.targetId + ','
                + TBL_REVENUE.colums.total + ','
                + TBL_REVENUE.colums.content + ')');
    });
};
DBAccess.prototype.getDB = function () {
    var self = this;
    return self.Db;
};
DBAccess.prototype.insert = function (table, item, _callback) {
    var self = this;
    var keys = Object.keys(item);
    var strColumn = '';
    var strValues = '';
    var lstValue = new Array();
    $.each(keys, function (i, key) {
        if (strColumn !== '')
            strColumn += ',';
        strColumn += key;
        if (strValues !== '')
            strValues += ',';
        strValues += '?';
        lstValue.push(item[key]);
    });
    var sqlQuery = 'INSERT INTO ' + table + ' (' + strColumn + ') VALUES (' + strValues + ')';
    self.Db.transaction(function (tx) {
        tx.executeSql(sqlQuery, lstValue);
        _callback();
    });
};
DBAccess.prototype.update = function (table, item, _callback) {
    var self = this;
    var keys = Object.keys(item);
    var strSetValues = '';
    var strConditions = '';
    var lstValues = new Array();
    $.each(keys, function (i, key) {
        if (strSetValues !== '')
            strSetValues += ',';
        if (strConditions !== '' && key.indexOf('_') === 0)
            strConditions += ' AND ';

        if (key.indexOf('_') === 0) {
            strConditions += key + '= ?';
        } else {
            strSetValues += key + '= ?';
            lstValues.push(item[key]);
        }
    });
    $.each(keys, function (i, key) {
        if (key.indexOf('_') === 0) {
            lstValues.push(item[key]);
        }
    });
    var sqlQuery = ' UPDATE ' + table + ' SET ' + strSetValues + ' WHERE ' + strConditions;
    self.Db.transaction(function (tx) {
        tx.executeSql(sqlQuery, lstValues);
        _callback();
    });
};
DBAccess.prototype.delete = function (table, item, _callback) {
    var self = this;
    var keys = Object.keys(item);
    var strConditions = '';
    var lstValues = new Array();
    $.each(keys, function (i, key) {
        if (key.indexOf('_') === 0) {
            if (strConditions !== '')
                strConditions += ' AND ';
            strConditions += key + '=?';
            lstValues.push(item[key]);
        }
    });
    var sqlQuery = ' DELETE FROM  ' + table + ' WHERE ' + strConditions;

    self.Db.transaction(function (tx) {
        tx.executeSql(sqlQuery, lstValues);
        _callback();
    });
};
DBAccess.prototype.backupAll = function (_callback) {
    var self = this;
    var lstTable = new Array();
    self.Db.transaction(function (tx) {
        var lstFun = new Array();
        var callback = function () {
            if (lstFun.length === 0) {
                _callback(lstTable);
                return;
            }
            var eCall = lstFun.shift();
            eCall();
        };
        // backup target
        lstFun.push(function () {
            var insTbl = new bakTable(TBL_TARGET.name);
            var sqlQuery = 'SELECT * FROM ' + TBL_TARGET.name;
            tx.executeSql(sqlQuery, [], function (tx, results) {
                $.each(results.rows, function (i, item) {
                    insTbl.lstItem.push(item);
                });
                lstTable.push(insTbl);
                callback();
            });
        });
        // backup food
        lstFun.push(function () {
            var insTbl = new bakTable(TBL_FOOD.name);
            var sqlQuery = 'SELECT * FROM ' + TBL_FOOD.name;
            tx.executeSql(sqlQuery, [], function (tx, results) {
                $.each(results.rows, function (i, item) {
                    insTbl.lstItem.push(item);
                });
                lstTable.push(insTbl);
                callback();
            });
        });
        // backup food history
        lstFun.push(function () {
            var insTbl = new bakTable(TBL_FOOD_HISTORY.name);
            var sqlQuery = 'SELECT * FROM ' + TBL_FOOD_HISTORY.name;
            tx.executeSql(sqlQuery, [], function (tx, results) {
                $.each(results.rows, function (i, item) {
                    insTbl.lstItem.push(item);
                });
                lstTable.push(insTbl);
                callback();
            });
        });
        // backup schdule
        lstFun.push(function () {
            var insTbl = new bakTable(TBL_SCHEDULE.name);
            var sqlQuery = 'SELECT * FROM ' + TBL_SCHEDULE.name;
            tx.executeSql(sqlQuery, [], function (tx, results) {
                $.each(results.rows, function (i, item) {
                    insTbl.lstItem.push(item);
                });
                lstTable.push(insTbl);
                callback();
            });
        });
        // backup cost
        lstFun.push(function () {
            var insTbl = new bakTable(TBL_COST.name);
            var sqlQuery = 'SELECT * FROM ' + TBL_COST.name;
            tx.executeSql(sqlQuery, [], function (tx, results) {
                $.each(results.rows, function (i, item) {
                    insTbl.lstItem.push(item);
                });
                lstTable.push(insTbl);
                callback();
            });
        });
        // backup other cost
        lstFun.push(function () {
            var insTbl = new bakTable(TBL_OTHER_COST.name);
            var sqlQuery = 'SELECT * FROM ' + TBL_OTHER_COST.name;
            tx.executeSql(sqlQuery, [], function (tx, results) {
                $.each(results.rows, function (i, item) {
                    insTbl.lstItem.push(item);
                });
                lstTable.push(insTbl);
                callback();
            });
        });
        // backup revenue
        lstFun.push(function () {
            var insTbl = new bakTable(TBL_REVENUE.name);
            var sqlQuery = 'SELECT * FROM ' + TBL_REVENUE.name;
            tx.executeSql(sqlQuery, [], function (tx, results) {
                $.each(results.rows, function (i, item) {
                    insTbl.lstItem.push(item);
                });
                lstTable.push(insTbl);
                callback();
            });
        });
        if (lstFun.length > 0) {
            (lstFun.shift())();
        }
    });
};
DBAccess.prototype.backupTable = function (_callback) {

};
function bakTable(_name) {
    var self = this;
    self.name = _name;
    self.lstItem = new Array();
}