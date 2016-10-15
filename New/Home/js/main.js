/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(function () {
    // delete database
    $('#btnDeleteAll').click(function () {
        deleteDB();
    });
    $('#btnBackup').click(function () {
        backupDb();
    });
    // back up
});
function deleteDB() {
    var result = confirm("Bạn có muốn xóa toàn bộ dữ liệu?");
    if (result !== true)
        return;
    localStorage.setItem("farmId", "0");
    (new DBAccess()).getDB().transaction(function (tx) {
        tx.executeSql("DROP TABLE IF EXISTS " + TBL_TARGET.name);
        tx.executeSql("DROP TABLE IF EXISTS " + TBL_FOOD.name);
        tx.executeSql("DROP TABLE IF EXISTS " + TBL_FOOD_HISTORY.name);
        tx.executeSql("DROP TABLE IF EXISTS " + TBL_SCHEDULE.name);
        tx.executeSql("DROP TABLE IF EXISTS " + TBL_OTHER_COST.name);
        tx.executeSql("DROP TABLE IF EXISTS " + TBL_COST.name);
        tx.executeSql("DROP TABLE IF EXISTS " + TBL_REVENUE.name);
    });
}
function backupDb() {
    (new DBAccess()).backupAll(function (lstObject) {
        var jsonValues = JSON.stringify(lstObject);
    });
}


