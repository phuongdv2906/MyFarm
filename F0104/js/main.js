/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(function () {
    var xxx = new MainControl();
});
function MainControl() {
    var self = this;
    self.Db = new StatisticDb();
    self.init();
}
MainControl.prototype.init = function () {
    var self = this;
    self.control = {};
    self.control.lstTargetView = $('#lstTargetView');
    self.control.startDate = $('#btnStartDate');
    self.control.endDate = $('#btnEndDate');
    self.control.lstFood = $('#lstFood');
    self.control.lstOther = $('#lstOther');
    self.control.totalFood = $('#lblFoodTotal');
    self.control.lblOtherTotal = $('#lblOtherTotal');
    self.control.startDate.val('2000-01-01');
    self.control.endDate.val('9999-01-01');
    self.control.btnSearch = $('#btnSearch');
    self.control.targetId = $('#target-id');
    self.control.totalCost = $('#lblGet');
    self.control.btnSearch.click(function () {
        self.listTargetInfo(self
                , self.control.targetId.text()
                , Com.DateToNumber(self.control.startDate.val())
                , Com.DateToNumber(self.control.endDate.val()));
    });
    self.resetListView();
};
MainControl.prototype.resetListView = function () {
    var self = this;
    self.control.lstTargetView.html('');
    self.Db.getAllTargets(function (results) {
        var len = results.rows.length, i;
        for (i = 0; i < len; i++) {
            var item = results.rows[i];
            var $li = $('<li></li>');
            $li.attr('value', JSON.stringify(item));
            $li.addClass('ui-first-child');
            $li.append('<a href="#target-info" class="ui-btn ui-btn-icon-right ui-icon-carat-r">' + item[TBL_TARGET.colums.name] + '</a>');
            $li.click(function () {
                self.control.targetId.text(JSON.parse($(this).attr('value'))[TBL_TARGET.colums.id]);
                self.listTargetInfo(self, JSON.parse($(this).attr('value'))[TBL_TARGET.colums.id]
                        , Com.DateToNumber(self.control.startDate.val())
                        , Com.DateToNumber(self.control.endDate.val()));
            });
            self.control.lstTargetView.append($li);
        }
    });
};
MainControl.prototype.listTargetInfo = function (self, targetId, startDate, endDate) {
    var totalCost = 0;
    // get all food
    self.Db.getTotalFood(targetId, startDate, endDate, function (results) {
        self.control.lstFood.html('');
        var total = 0;
        $.each(results.rows, function (i, item) {
            var strHtml = '<li><a href="#">' + item[TBL_FOOD.colums.name]
                    + '<span class="ui-li-count">'
                    + item[TBL_COST.colums.quanlity] + ' Bao</span></a></li>';
            self.control.lstFood.append(strHtml);
            total += item[TBL_SELECT.totalFood];
        });
        totalCost += total;
        self.control.totalCost.text(totalCost + ' VND');
        self.control.lstFood.listview('refresh');
        self.control.totalFood.text(total + ' VND');
    });
    // get other
    self.Db.getTotalOther(targetId, startDate, endDate, function (results) {
        self.control.lstOther.html('');
        var total = 0;
        $.each(results.rows, function (i, item) {
            var strHtml = '<li><a href="#">' + item[TBL_SCHEDULE.colums.content]
                    + '<span class="ui-li-count">'
                    + item[TBL_OTHER_COST.colums.price] + ' VND</span></a></li>';
            self.control.lstOther.append(strHtml);
            total += item[TBL_OTHER_COST.colums.price];
        });
        totalCost += total;
        self.control.totalCost.text(totalCost + ' VND');
        self.control.lstOther.listview('refresh');
        self.control.lblOtherTotal.text(total + ' VND');
    });
};
