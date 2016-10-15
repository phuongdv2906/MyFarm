/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var Com = {};
Com.DbAccess = window.openDatabase('mydb', '1.0', 'my first database', 50 * 1024 * 1024);
Com.getGenerateId = function (ScreenId) {
    if (localStorage.getItem("farmId") === null)
        localStorage.setItem("farmId", "0");
    var generateCode = parseInt(localStorage.getItem("farmId"));
    generateCode += 1;
    localStorage.setItem("farmId", generateCode);
    return ScreenId + generateCode;
};
Com.getToday = function () {
    var day = (new Date()).getDate() + '';
    var month = (new Date()).getMonth() + 1;
    month += '';
    if (day.length < 2)
        day = '0' + day;
    if (month.length < 2)
        month = '0' + month;
    return (new Date()).getFullYear() + '-' + month + '-' + day;
};
Com.DateToNumber = function (value) {
    value = value + '';
    var lstText = value.split('-');
    if (lstText.length < 3)
        return '';
    return parseInt(lstText[0] + lstText[1] + lstText[2]);
};
Com.NumberToDate = function (value) {
    value = value + '';
    var x =  value.substring(0, 4) + '-' + value.substring(4, 6) + '-' + value.substring(6, 8);
    return x;
};
// table list
TBL_TARGET = {
    name: 'Target',
    colums: {
        id: '_targetid',
        name: 't_name',
        area: 't_area',
        status: 't_status',
        content: 't_content'
    }
};
TBL_FOOD = {
    name: 'Food',
    colums: {
        id: '_foodid',
        name: 'f_name',
        weight: 'f_weight',
        content: 'f_content'
    }
};
TBL_FOOD_HISTORY = {
    name: 'FoodHistory',
    colums: {
        id: '_fhistoryid',
        foodId: 'fh_foodId',
        startApply: 'fh_startApply',
        endApply: 'fh_endApply',
        price: 'fh_price'
    }
};
TBL_SCHEDULE = {
    name: 'Schedule',
    colums:{
        id: '_scheduleid',
        date: 's_date',
        targetId:'s_targetId',
        costId: 's_costId',
        content: 's_content'
    }
};
TBL_COST = {
    name: 'Cost',
    colums:{
        id: '_costid',
        type: 'c_type',
        targetId:'c_targetId',
        quanlity: 'c_quanlity'
    }
};
TBL_OTHER_COST = {
    name: 'OtherCost',
    colums:{
        id: '_othercostid',
        price:'oc_price'
    }
};
TBL_REVENUE = {
    name: 'Revenue',
    colums:{
        id: '_revenueid',
        date: 'r_date',
        targetId:'r_targetId',
        total: 'r_total',
        content: 'r_content'
    }
};
TBL_SELECT = {
    totalFood: 'totalFood'
};
// schedule
Com.ListTableName = {
    TARGET : TBL_TARGET,
    FOOD: TBL_FOOD,
    SCHEDULE: TBL_SCHEDULE,
    OTHER_COST: TBL_OTHER_COST,
    COST: TBL_COST,
    REVENUE: TBL_REVENUE,
    FOOD_HISTORY: TBL_FOOD_HISTORY
};



