var generateCode = null;
$(function () {
    var self = this;
    // control
    self._Control = new MainControl();
    // self._Control.generateSchedule();
});

// Main control
function MainControl() {
    // get control
    var self = this;
    self.mode = 'ADD';
    self.insItemView = {};
    self.Db = new ScheduleDatabase();
    self.init();
    self.getInitData();
}
MainControl.prototype.init = function () {
    var self = this;
    // get element
    self.control = {};
    self.control.btnDate = $('#btnDate');
    self.control.lstTarget = $('#lstTarget');
    self.control.lstType = $('#lstType');
    self.control.lstFood = $('#lstFood');
    self.control.btnAdd = $('#btnAdd');
    self.control.btnSave = $('#btnSave');
    self.control.btnDelete = $('#btnDelete');
    self.control.addDialog = $('#dialog-add');
    self.control.txtQuanlity = $('#txtQuanlity');
    self.control.txtPrice = $('#txtPrice');
    self.control.txtContent = $('#txtContent');
    self.control.lstSchedule = $('#lstSchedule');
    self.control.btnAdd.click(function () {
        self.mode === 'ADD';
        self.control.btnDelete.parent().hide();
        self.clearToAddMode();
    });
    self.control.btnSave.click(function () {
        self.saveItem();
    });
    self.control.btnDelete.click(function(){
        var results = confirm('Bạn có muốn xóa ?');
        if(results === true){
            self.deleteItem();
        }
    });
    self.getAllSchedules();
};
MainControl.prototype.getInitData = function () {
    var self = this;
    // Target generate
    self.control.lstTarget.html('<option value="9999">Đối tượng</option>');
    self.Db.getAllTargets(function (results) {
        var len = results.rows.length, i;
        for (i = 0; i < len; i++) {
            var item = results.rows[i];
            var $option = $('<option></option>');
            $option.val(item[TBL_TARGET.colums.id]);
            $option.text(item[TBL_TARGET.colums.content]);
            self.control.lstTarget.append($option);
        }
    });
    // get food
    self.control.lstFood.html('<option value="9999">Loại thức ăn</option>');
    self.Db.getAllFood(function (results) {
        var len = results.rows.length, i;
        for (i = 0; i < len; i++) {
            var item = results.rows[i];
            var $option = $('<option></option>');
            $option.val(item[TBL_FOOD.colums.id]);
            $option.text(item[TBL_FOOD.colums.name]);
            self.control.lstFood.append($option);
        }
    });
    // type
    self.control.lstType.change(function () {
        if (self.control.lstType.val() === '0') {
            $('#panel-food-control').show('flip');
            $('#panel-other-control').hide('flip');
        } else if (self.control.lstType.val() === '1') {
            $('#panel-food-control').hide('flip');
            $('#panel-other-control').show('flip');
        }
    });
};
MainControl.prototype.getAllSchedules = function () {
    var self = this;
    self.control.lstSchedule.html('');
    self.Db.getSchedules(function (lstItem) {
        $.each(lstItem, function (i, item) {
            var $li = $('<li></li>');
            $li.attr('value', JSON.stringify(item));
            $li.addClass('ui-first-child');
            var txtView = Com.NumberToDate(item[TBL_SCHEDULE.colums.date]) + ' ～ ' + item[TBL_SCHEDULE.colums.content];
            $li.append('<a href="#dialog-add" data-rel="dialog" class="ui-btn ui-btn-icon-right ui-icon-carat-r">' + txtView + '</a>');
            $li.click(function () {
                self.mode = 'EDIT';
                self.clearToEdit($(this).attr('value'));
                self.control.btnDelete.parent().show();
            });
            self.control.lstSchedule.append($li);
        });
    });
};
MainControl.prototype.clearToAddMode = function () {
    var self = this;
    self.insItemView = {};
    // list selected
    self.control.lstType.val('0');
    self.control.lstType.selectmenu().selectmenu('refresh', true);
    $('#panel-food-control').show();
    $('#panel-other-control').hide();
    // date init
    self.control.btnDate.val(Com.getToday());
    self.control.lstTarget.val('9999');
    self.control.lstTarget.selectmenu().selectmenu('refresh', true);
    self.control.lstFood.val('9999');
    self.control.lstFood.selectmenu().selectmenu('refresh', true);
    //
    self.control.txtQuanlity.val('');
    self.control.txtContent.val('Cho ăn');
    self.control.txtPrice.val('');

};
MainControl.prototype.clearToEdit = function (jText) {
    var self = this;
    self.insItemView = JSON.parse(jText);
    // list selected
    self.control.lstType.val(self.insItemView[TBL_COST.colums.type]);
    self.control.lstType.selectmenu().selectmenu('refresh', true);
    if (self.control.lstType.val() === '0') {
        $('#panel-food-control').show();
        $('#panel-other-control').hide();
    } else {
        $('#panel-food-control').hide();
        $('#panel-other-control').show();
    }
    // date init
    self.control.btnDate.val(Com.NumberToDate(self.insItemView[TBL_SCHEDULE.colums.date]));

    self.control.lstTarget.val(self.insItemView[TBL_SCHEDULE.colums.targetId]);
    self.control.lstTarget.selectmenu().selectmenu('refresh', true);
    if (self.control.lstType.val() === '0') {
        self.control.lstFood.val(self.insItemView[TBL_COST.colums.targetId]);
        self.control.lstFood.selectmenu().selectmenu('refresh', true);
    } else {
        self.control.txtPrice.val(self.insItemView[TBL_OTHER_COST.colums.price]);
    }
    self.control.txtQuanlity.val(self.insItemView[TBL_COST.colums.quanlity]);
    //
    self.control.txtContent.val(self.insItemView[TBL_SCHEDULE.colums.content]);
};
MainControl.prototype.saveItem = function () {
    var self = this;
    // validate
    var isOK = true;
    if ((self.control.lstType.val() === '0' && ($.trim(self.control.txtQuanlity.val()) === ''
            || self.control.lstFood.val() === '9999'))
            || (self.control.lstType.val() === '1' && $.trim(self.control.txtPrice.val()) === '')) {
        isOK = false;
    }
    if (self.control.lstTarget.val() === '9999') {
        isOK = false;
    }
    if (isOK === false) {
        alert('Nhập sai dữ liệu !');
        return;
    }
    var getData = function () {
        // get new data
        self.insItemView[TBL_SCHEDULE.colums.date] = Com.DateToNumber(self.control.btnDate.val());
        self.insItemView[TBL_TARGET.colums.id] = self.control.lstTarget.val();
        self.insItemView[TBL_COST.colums.type] = self.control.lstType.val();
        if (self.insItemView[TBL_COST.colums.type] === '0') {
            self.insItemView[TBL_FOOD.colums.id] = self.control.lstFood.val();
            self.insItemView[TBL_COST.colums.quanlity] = parseFloat(self.control.txtQuanlity.val());
        } else {
            self.insItemView[TBL_OTHER_COST.colums.price] = parseInt(self.control.txtPrice.val());
            self.insItemView[TBL_COST.colums.quanlity] = 1;
        }
        self.insItemView[TBL_SCHEDULE.colums.content] = self.control.txtContent.val();
        // -----------------------------------------------------------------------------
    };
    // save
    if (self.mode === 'EDIT') {
        self.mode = 'ADD';
        self.Db.delete(self.insItemView, function () {
            getData();
            self.Db.save(self.mode, self.insItemView, function () {
                self.getAllSchedules();
                self.control.addDialog.dialog('close');
            });
        });
    } else {
        getData();
        self.Db.save(self.mode, self.insItemView, function () {
            self.getAllSchedules();
            self.control.addDialog.dialog('close');
        });
    }
};
MainControl.prototype.deleteItem = function () {
    var self = this;
    if (self.mode !== 'EDIT')
        return;
    self.insItemView[TBL_SCHEDULE.colums.date] = Com.DateToNumber(self.control.btnDate.val());
    self.insItemView[TBL_TARGET.colums.id] = self.control.lstTarget.val();
    self.insItemView[TBL_COST.colums.type] = self.control.lstType.val();
    if (self.insItemView[TBL_COST.colums.type] === '0') {
        self.insItemView[TBL_FOOD.colums.id] = self.control.lstFood.val();
        self.insItemView[TBL_COST.colums.quanlity] = parseInt(self.control.txtQuanlity.val());
    } else {
        self.insItemView[TBL_OTHER_COST.colums.price] = parseInt(self.control.txtPrice.val());
        self.insItemView[TBL_COST.colums.quanlity] = 1;
    }
    self.insItemView[TBL_SCHEDULE.colums.content] = self.control.txtContent.val();

    // delete item
    self.Db.delete(self.insItemView, function () {
        self.getAllSchedules();
        self.control.addDialog.dialog('close');
    });
};
