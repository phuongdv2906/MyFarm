/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(function () {
    var control = new FoodControl();
});
function FoodControl() {
    var self = this;
    self.mode = 'ADD';
    self.Db = new FoodDb();
    self.init();
    self.getAllFood();
}
FoodControl.prototype.viewItem = function (item) {
    var self = this;
    self.control.name.val(item[TBL_FOOD.colums.name]);
    self.control.weight.val(item[TBL_FOOD.colums.weight]);
    self.control.txtStartDate.val(Com.NumberToDate(item[TBL_FOOD_HISTORY.colums.startApply]));
    self.control.price.val(item[TBL_FOOD_HISTORY.colums.price]);
    self.control.setPrice.val(item[TBL_FOOD_HISTORY.colums.price]);
    self.control.content.val(item[TBL_FOOD.colums.content]);
    self.control.foodId.text(item[TBL_FOOD.colums.id]);
    $.mobile.changePage('#food-info', {
        role: 'dialog'
    });
};

FoodControl.prototype.getAllFood = function () {
    var self = this;
    self.control.lstFoodView.html('');
    self.Db.getAllFood(function (results) {
        var len = results.rows.length, i;
        var foodId_tmp = '';
        for (i = 0; i < len; i++) {
            var item = results.rows[i];
            if (foodId_tmp === item[TBL_FOOD_HISTORY.colums.foodId])
                continue;
            foodId_tmp = item[TBL_FOOD_HISTORY.colums.foodId];
            var $li = $('<li></li>');
            $li.attr('value', JSON.stringify(item));
            $li.addClass('ui-first-child');
            $li.append('<a href="#" class="ui-btn ui-btn-icon-right ui-icon-carat-r">'
                    + item[TBL_FOOD.colums.name] + ' - '
                    + item[TBL_FOOD_HISTORY.colums.price] + ' VND</a>');
            $li.click(function () {
                self.clearText();
                self.viewItem(JSON.parse($(this).attr('value')));
                $('.block-btnDelete').show();
                self.mode = 'EDIT';
            });
            self.control.lstFoodView.append($li);
        }
    });
};

FoodControl.prototype.init = function () {
    var self = this;
    self.control = {};
    self.control.infoDialog = $('#food-info');
    self.control.formPriceSet = $('#form-price-set');
    self.control.txtStartDate = $('#txtStartDate');
    self.control.lstFoodView = $('#lstFoodView');
    self.control.name = $('#txtName');
    self.control.weight = $('#txtWeight');
    self.control.price = $('#txtPrice');
    self.control.setPrice = $('#setPrice');
    self.control.content = $('#txtContent');
    self.control.foodId = $('#span-foodId');
    // event
    self.control.btnAdd = $('#btnAdd');
    self.control.btnAdd.click(function () {
        self.clearText();
        self.mode = 'ADD';
        $.mobile.changePage('#food-info', {
            role: 'dialog'
        });
    });
    // change price
    self.control.btnChangePrice = $('#btnChangePrice');
    self.control.btnChangePrice.click(function () {
        $('#form-price-set').show();
    });
    self.control.btnSetPrice = $('#btnSetPrice');
    self.control.btnSetPrice.click(function () {
        self.control.formPriceSet.hide();
    });
    self.control.btnSave = $('#btnSave');
    self.control.btnSave.click(function () {
        self.saveFood();
    });
    self.control.setPrice.keyup(function () {
        self.control.price.val($(this).val());
    });
    self.control.btnSetPrice = $('#btnSetPrice');
    self.control.btnSetPrice.click(function () {
        self.savePrice();
    });
    // delete food
    self.control.btnDelete = $('#btnDelete');
    self.control.btnDelete.click(function(){
        self.deleteFood();
    });
};
FoodControl.prototype.clearText = function () {
    var self = this;
    self.control.formPriceSet.hide();
    self.control.txtStartDate.val('1000-01-01');
};

FoodControl.prototype.saveFood = function () {
    var self = this;
    // input check
    var isOk = true;
    if (self.control.txtStartDate.val() === '' || self.control.name.val() === ''
            || self.control.weight.val() === '' || self.control.txtStartDate.val() === ''
            || self.control.price.val() === '')
        isOk = false;
    if (isOk === false) {
        alert('Nhập giá trị sai ! Hãy nhập lại');
        return;
    }
    var foodId = '';
    if (self.mode === 'ADD')
        foodId = Com.getGenerateId('F');
    else if (self.mode === 'EDIT')
        foodId = self.control.foodId.text();
    // update
    var foodItem = new FoodItem({
        foodId: foodId,
        name: self.control.name.val(),
        weight: self.control.weight.val(),
        content: self.control.content.val()
    });

    var historyItem = new FoodHistory({
        historyId: Com.getGenerateId('FH'),
        foodId: foodId,
        startApply: Com.DateToNumber(self.control.txtStartDate.val()),
        endApply: 99991231,
        price: parseInt(self.control.setPrice.val())
    });
    // save to database
    self.Db.saveFood(self.mode, foodItem, function () {
        if (self.mode === 'ADD') {
            self.Db.insertFoodHistory(historyItem, function () {
                self.getAllFood();
                self.control.infoDialog.dialog('close');
            });
        } else {
            self.getAllFood();
            self.control.infoDialog.dialog('close');
        }
    });
};
FoodControl.prototype.deleteFood = function () {
    var self = this;
    var result = confirm('Bạn có chắc chắn muốn xóa ?');
    if (result !== true || self.control.foodId.text() === '')
        return;
    var foodItem = new FoodItem({
        foodId: self.control.foodId.text(),
        name: self.control.name.val(),
        weight: self.control.weight.val(),
        content: self.control.content.val()
    });
    self.Db.deleteHistoryByFoodId(self.control.foodId.text(), function () {
        self.Db.delete(foodItem, function () {
            self.getAllFood();
            self.control.infoDialog.dialog('close');
        });
    });
};
FoodControl.prototype.savePrice = function () {
    var self = this;
    if (self.mode === 'ADD')
        return;
    // check input 
    if (self.control.txtStartDate.val() === '' || self.control.setPrice.val() === '') {
        alert('Nhập giá trị sai ! Hãy nhập lại');
        return;
    }
    var historyItem = new FoodHistory({
        historyId: Com.getGenerateId('FH'),
        foodId: self.control.foodId.text(),
        startApply: Com.DateToNumber(self.control.txtStartDate.val()),
        endApply: 99991231,
        price: parseInt(self.control.setPrice.val())
    });
    self.Db.insertFoodHistory(historyItem, function () {
        alert('Thay đổi giá !');
    });
};

function FoodItem(data) {
    var self = this;
    self[TBL_FOOD.colums.id] = data.foodId;
    self[TBL_FOOD.colums.name] = data.name;
    self[TBL_FOOD.colums.weight] = data.weight;
    self[TBL_FOOD.colums.content] = data.content;
}
function FoodHistory(data) {
    var self = this;
    self[TBL_FOOD_HISTORY.colums.id] = data.historyId;
    self[TBL_FOOD_HISTORY.colums.foodId] = data.foodId;
    self[TBL_FOOD_HISTORY.colums.startApply] = data.startApply;
    self[TBL_FOOD_HISTORY.colums.endApply] = data.endApply;
    self[TBL_FOOD_HISTORY.colums.price] = data.price;
}
