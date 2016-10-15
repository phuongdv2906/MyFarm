
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function () {

};
$(function () {
    var control = new TargetControl();
});
function TargetControl() {
    var self = this;
    self.mode = 'ADD';
    self.Db = new TargetDb();
    self.init();
}
TargetControl.prototype.init = function () {
    var self = this;
    self.control = {};
    self.control.btnSave = $('#btnSave');
    self.control.btnDelete = $('#btnDelete');
    self.control.targetId = $('#targetId');
    self.control.name = $('#txtName');
    self.control.content = $('#txtContent');
    self.control.lstTarget = $('#lstTargetView');
    // init Date
    self.control.area = $('#txtArea');
    self.control.status = $('#lstStatus');
    self.control.dialogInfo = $('#target-info');
    self.control.btnAdd = $('#btnAdd');
    self.control.btnAdd.click(function () {
        $('.block-btnDelete').hide();
        self.mode = 'ADD';
        $.mobile.changePage("#target-info", {
            role: "dialog"
        });
    });
    // Get list 
    self.control.btnSave = $('#btnSave');
    self.control.btnSave.click(function () {
        self.saveTarget();
    });
    self.control.btnDelete.click(function () {
        self.deleteTarget();
    });
    self.getAllTarget();
};

TargetControl.prototype.viewItem = function (item) {
    var self = this;
    self.control.name.val(item[TBL_TARGET.colums.name]);
    self.control.area.val(item[TBL_TARGET.colums.area]);
    self.control.status.val(item[TBL_TARGET.colums.status]);
    self.control.status.selectmenu().selectmenu("refresh", true);
    self.control.content.val(item[TBL_TARGET.colums.content]);
    self.control.targetId.text(item[TBL_TARGET.colums.id]);
    $.mobile.changePage("#target-info", {
        role: "dialog",
        closeBtn: "none"
    });
};
TargetControl.prototype.clearText = function () {
    var self = this;
    self.control.name.val('');
    self.control.content.val('');
};
TargetControl.prototype.getAllTarget = function () {
    var self = this;
    self.control.lstTarget.html('');
    self.Db.getAllTargets(function(results){
        var len = results.rows.length, i;
        for (i = 0; i < len; i++) {
            var item = results.rows[i];
            var $li = $('<li></li>');
            $li.attr('value', JSON.stringify(item));
            $li.addClass('ui-first-child');
            $li.append('<a href="#" class="ui-btn ui-btn-icon-right ui-icon-carat-r">' + item[TBL_TARGET.colums.name] 
                    + ' - '  + item[TBL_TARGET.colums.content] + '</a>');
            $li.click(function () {
                self.clearText();
                self.viewItem(JSON.parse($(this).attr('value')));
                $('.block-btnDelete').show();
                self.mode = 'EDIT';
                self.control.btnDelete.parent().show();
            });
            self.control.lstTarget.append($li);
        }
    });
};
TargetControl.prototype.saveTarget = function () {
    var self = this;
    if ($.trim(self.control.name.val()) === ''
        || $.trim(self.control.content.val()) === ''){
        alert('Nhập sai dữ liệu');
        return;
    }
    var id = 0;
    if (self.mode === 'ADD')
        id = Com.getGenerateId('T');
    else if (self.mode === 'EDIT')
        id = self.control.targetId.text();

    var item = new TargetItem({
        targetId: id,
        name: self.control.name.val(),
        area: self.control.area.val(),
        status: self.control.status.val(),
        content: self.control.content.val()
    });
    self.Db.save(self.mode, item, function () {
        self.getAllTarget();
        self.control.dialogInfo.dialog('close');
    });
};
TargetControl.prototype.deleteTarget = function () {
    var self = this;
    var result = confirm('Bạn có chắc chắn muốn xóa ?');
    if (result !== true || self.control.targetId.text() === '')
        return;
    self.Db.delete(new TargetItem({
        targetId: self.control.targetId.text(),
        name: self.control.name.val(),
        area: self.control.area.val(),
        status: self.control.status.val(),
        content: self.control.content.val()
    }), function () {
        self.getAllTarget();
        self.control.dialogInfo.dialog('close');
    });
};
// targetitem
function TargetItem(data) {
    var self = this;
    self[TBL_TARGET.colums.id] = data.targetId;
    self[TBL_TARGET.colums.name] = data.name;
    self[TBL_TARGET.colums.area] = data.area;
    self[TBL_TARGET.colums.status] = data.status;
    self[TBL_TARGET.colums.content] = data.content;
}