

$(function(){
  
  SparCart.OrderManager.init();
  
});


var SparCart = {};
SparCart.OrderManager = new function () {
	
	this.rowSelectors = ['input[name=name]', 'select[name=main]', 'select[name=side]', 'select[name=beer]', 'td[name=total]'];
	
	this.init = function () {
		this.attachEvents();
	}
	
	this.attachEvents = function() {
		var me = this;
		$('.add').on('click', function () {
			me.addOrder();
		});
		
		$('.remove').live('click', function (e) {
			me.removeOrder(e);
		});
		
		$('.undo').on('click', function (e) {
			me.undoOrder(e);
		});
		
		$("select[name=main], select[name=side], select[name=beer]").live('change', function (e){
           me.showTotal(e);
        });
		
		$('.submit').on('click',function(e) {
			this.blur();
			me.showFormContent(e);
			return false;
		});
		
		$('.reset').on('click',function(e) {
			this.blur();
		});
		
	};
	
	this.showFormContent = function(e) {
		var serializedData = $('form').serialize();
		//For readablity
		var data = decodeURIComponent(serializedData);
		alert(data);
	};
	
	this.addOrder = function () {
		var $last = $('tbody tr:last');
		var newOrder = $last.clone();
		newOrder.prependTo('tbody');
		var selectors = ['input[name=name]', 'select[name=main]', 'select[name=side]','select[name=beer]'];
		_.each(selectors, function(selector){
			if(selector.indexOf('select[') > -1) {
				var index = $last.find(selector).get(0).selectedIndex;
				newOrder.find(selector)[0].selectedIndex = index;;
			}
			$last.find(selector).val('');
		});
		
		$('td[name=total]:last').html('$0.00');
	};
	
	this.removeOrder = function(e) {
		var r=confirm("Are you sure?")
		if (r==true) {
		    var row = $(e.target).parent().parent(); 
			var data = [];
			_.each(this.rowSelectors, function(selector) {	
				var val = row.find(selector).val();
				if(selector.indexOf('td[') > -1) {
					val = row.find(selector).html();
				} else if(selector.indexOf('select[') > -1) {
					val = row.find(selector).get(0).selectedIndex;
				}
				data.push(val);
			});
			
			//push in html5 local storage to undo
			var delRecords = $(document).data("del-records");
			if(!delRecords) {
				delRecords = [];
			}
			delRecords.push(data);
			$(document).data("del-records", delRecords);
			
			row.remove();
		    this.showSubtotal();
		}		
	};
	
	this.undoOrder = function (e) {
		var delRecords = $(document).data("del-records");
		if(!delRecords || delRecords.length === 0) {
			alert('There is nothing undo');
			return false;
		}			
		var undoRecord = delRecords.pop();
		//reset data to localstorage
		$(document).data("del-records", delRecords);
		
		var $last = $('tbody tr:last');
		var newOrder = $last.clone();
		newOrder.prependTo('tbody');
		_.each(this.rowSelectors, function(selector, index){
			if(selector.indexOf('td[') > -1) {
				newOrder.find(selector).html(undoRecord[index]);
			} else if(selector.indexOf('select[') > -1) {
				newOrder.find(selector)[0].selectedIndex = undoRecord[index];;
			} else {
				newOrder.find(selector).val(undoRecord[index]);
			}			
		});
		this.showSubtotal();		
	};
	
	this.showTotal = function (e) {
		var targetRow = $(e.target).parent().parent();
		var main = targetRow.find("select[name=main]").val(),
			side = targetRow.find("select[name=side]").val(),
			beer = targetRow.find("select[name=beer]").val(),
			total = this.getTotal([main, side, beer]);
		targetRow.find('td[name=total]').html("$" +total);
		this.showSubtotal();
	};
	
	this.getTotal = function (array) {
		return array.reduce(function(pv, cv) {
			cv = $.trim(cv.replace('$','')) || 0;
			return pv + (isNaN(cv) ? 0 : parseFloat(cv));
		}, 0);
	};
	
	this.showSubtotal = function () {
		var totalElems = $('.row-total, td[name=total]');
		var totals = _.map(totalElems, function(elem){ 
			return parseFloat($(elem).html().replace('$', ''));
		});
		var subTotal = _.reduce(totals, function(memo, num){ return memo + num; }, 0)
		$('.sub-total').html('$' + subTotal);
	}
	
}