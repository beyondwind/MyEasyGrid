/*
 * MyEasygrid for jQuery -  v1.8.3
 *
 * Copyright (c) 2013 Jiabei Li
 *
 */
(function($) {
	$.setPagination = function(p, pc) {
		pc = $.extend({
		
		},pc);
		var t = {
		
		}
	}

	$.addGrid = function(g, st) {
		st = $.extend({
			url : '',
			method : 'POST',
			pageNo : 1,
			pageSize : 5,
			rowid : 'id',
			rowidType : 'checkbox',//hidden
			number :false,
			conditions : [],
			buttons : [],
			batchButton : [],
			result : [],
			onPageChange : null,
			onRowDbclick : null,
			onFinish : null
		}, st);
		var t = {
			init : function() {
				var gridTable = $('<table class="table table-hover">');
				var colGroup = $('<colgroup>').append($('<col width="4%"/>'));
				var thead = $('<thead>');
				var tfoot = $('<tfoot>');
				var tbody = $('<tbody></tbody>');
				var ckall = $('<input class="checkall" type="' + st.rowidType + '"/>');
				var headtr = $('<tr>').append($('<th>').html(ckall));
				if(st.number == true){
					colGroup.append('<col width="4%" />');
					headtr.prepend('<th>编号</th>');
				}
				$.each(st.result, function(index, value) {
					var col = $('<col width="' + value.weight + '" />');
					colGroup.append(col);
					var titleth = $('<th align="' + value.align + '">' + value.title + '</th>');
					headtr.append(titleth);
				});
				thead.html(headtr);
				var columnLenth = st.number == true ? st.result.length + 2:st.result.length + 1;
				var pagination = '<td colspan="' + columnLenth 
				+ '"><section class="pagination-section"><div class="pagination-left"></div><div class="pagination"></div></section></td>';
				tfoot.html($('<tr></tr>').html(pagination));
				gridTable.append(colGroup).append(thead).append(tfoot).append(tbody);
				$(g).html(gridTable);
				t.tbody = tbody;
				t.pagination = pagination;
				t.url = st.url;
				t.pageNo = st.pageNo;
				t.onPageChange = st.onPageChange;
				t.onRowDbclick = st.onRowDbclick;
				t.onFinish = st.onFinish;
				t.ckall = ckall;
				ckall.click(function() {
					if (ckall.prop('checked')) {
						$('input[name="ck_box"]',g).each(function() {
							this.checked = true;
						});
					} else {
						$('input[name="ck_box"]',g).each(function() {
							this.checked = false;
						});
					}
				});
				$.each(st.buttons, function(index, value) {
					$('#' + value.id).click(function() {
						if (value.action != null && value.action != '')
							t.url = value.action;
						else
							t.url = st.url;
						t.getcondition();
						t.page_change(1);
						return false;
					});
				});
				$.each(st.batchButton, function(index, value) {
					if(index>0)
						$('.pagination-left', g).append('&nbsp;&nbsp;');
					var btn = $(value.tag);
					if(value.tag)
						btn.bind('click',value.tagClick);
					$('.pagination-left', g).append(btn);
				});
			},// end init

			// 获取条件
			getcondition : function() {
				var condition = 'pageSize=' + st.pageSize;
				$.each(st.conditions, function(index, value) {
					if (value.type == 'checkbox') {
						$('input[name=' + value.inputId + ']:checked').each(
								function() {
									condition = condition + '&' + value.postName + '=' + $(this).val();
								});
					} else
						condition = condition + '&' + value.postName + '=' + $('#' + value.inputId).val();
				});// condition = condition + '&pageNo=' + index;
				t.condition = condition;
			},// end getcondition

			// 时间格式设置
			_dateFormat : function(datetime, format, nullif) {
				return (datetime == null || datetime ==' ' ) ? nullif : new Date(datetime)
						.format(format);
			},

			// 提交请求
			_conditionpost : function(pg) {
				$.ajax({
					type : st.method,
					url : t.url,
					dataType : st.dataType,
					data : t.condition + '&pageNo=' + pg,
					success : function(data) {
						t.add_data(data);
					}
				}).fail(function(jqXHR, textStatus) {
					alert("Request failed: " + textStatus);
				});
			},// end _conditionpost

			// 翻页
			page_change : function(pg) {
				if (t.onPageChange) {
					var e = {
						pageNo : t.pageNo,
						clickPageNo : pg
					}
					$(t.onPageChange(e));
				}
				if (t.url == null || t.url == '')
					return false;
				else {
					t._conditionpost(pg);
				}
			},// end page_change

			// 双击一行
			_click_row : function() {
				$('tbody tr', g).dblclick(function() {
					if (t.onRowDbclick) {
						var rowId = $('input[name="ck_box"]', this).val();
						$(t.onRowDbclick(rowId));
					}
				});
			},
			//生成分页号码函数
			_generatePg : function(index,content) {
				if(index < 1)
					return '<li class="active"><span>' + content + '</span></li>';
				else
					return '<li><a href="javascript:void(0);" tabindex=' + index + '>' + content + '</a></li>';
			},
			// 展现数据
			add_data : function(data) {
				$('#checkall').removeAttr("checked");
				t.tbody.html('');
				var _pageNo = 0;
				var _totalPages = 0;
				var pages = '<ul>';
				// 遍历数据集，展现数据
				var row_count = 0;
				$.each(data.result,function(key, val) {
					var srow = $('<tr></tr>');
					if(st.number == true){
						srow.append('<th style="text-align:center;">' + (row_count+1) + '</th>');
					}
					var ckbox = $('<input name="ck_box" type="' + st.rowidType + '" value="' + val[st.rowid] + '"/>');
					srow.append($('<td>').html(ckbox));
					
					$.each(st.result,function(index, _val) {
						var value = $('<td>');
						if(_val.operation){
							for(var i=0; i<_val.operation.length ; i++){
								if(_val.operation[i].condition){
									if(val[_val.operation[i].condition.valueName]!=_val.operation[i].condition.need)
										continue;
								}
								if(i>0)
									value.append('<span style="margin:0 3px;">/</span>');
								var tag = _val.operation[i].tag;
								var data ='{';
								for(var j=0; j<_val.operation[i].parameters.length; j++){
									var para = _val.operation[i].parameters[j];
									if(j>0)
										data+=',';
									var v = val[para] == null ? '' : val[para];
									data = data + para + ':"' + v + '"';
									tag = tag.replace('{'+ j +'}',v);
								}
								data +='}';
								if(_val.operation[i].tagClick){
									var btn = $(tag);
									btn.bind('click',eval('(' + data + ')'),_val.operation[i].tagClick);
									value.append(btn);
								} else
									value.append(tag);
								
							}
						}else{
							var keys = _val.valueName.split("\.");
							v = val[keys[0]] == null ? ' ' : val[keys[0]];
							for ( var i = 1; i < keys.length; i++) {
								v = v[keys[i]];
								if (v == null) {
									v = ' ';
									break;
								}
							}
							if (typeof v == "object")
								v = ' ';
							if (_val.format)
								v = t._dateFormat(v,_val.format,' ');
							value.html(v);
						}
						srow.append(value);
					});
					t.tbody.append(srow);
					row_count++;
				});
				_pageNo = data.pageNo;
				_totalPages = data.totalPages;
				
				// 填充无数据的行
				for (; row_count < st.pageSize; row_count++) {
					t.tbody.append('<tr><td colspan="' + (st.result.length + 2) + '">' + '&nbsp;' + '</td></tr>');
				}
				// 首页链接
				if (_pageNo > 1 && _totalPages > 1){
					pages += t._generatePg(1,'首页');
				// 上一页链接
					pages += t._generatePg(_pageNo - 1,'上一页');
				}
				// 页码链接
				for ( var i = 1; i <= _totalPages; i++) {
					if (i != _pageNo && ((_pageNo - i) < 5 && (i - _pageNo) < 5))
						pages += t._generatePg(i,i);
					else if (i == _pageNo)
						pages += t._generatePg(0,i);
				}
				// 下一页链接
				if (_pageNo < _totalPages && _totalPages > 1){
					pages += t._generatePg(_pageNo + 1,'下一页');
				// 最后一页链接
					pages += t._generatePg(_totalPages,'尾页');
				}
				pages = pages + '<li>&nbsp;&nbsp;&nbsp;共<b>' + data.records + '</b>条，<b>' + _totalPages + '</b>页&nbsp;<input type="text" class="skip" /></li>';
				pages += '<span href="javascript:void(0);" class="skipbtn">确定</span>';
				pages += '</ul>';
				$('.pagination', g).html(pages);
				$('.skipbtn', g).click(function(){
					var pNo = $('.skip', g).val();
					if(!isNaN(pNo)){
						if(_totalPages<pNo)
							t.page_change(_totalPages);
						else if(pNo<1)
							t.page_change(1);
						else
							t.page_change(pNo);
					}
				});
				$('.pagination a', g).click(function() {
					t.page_change($(this).attr('tabindex'));
				});
				if(t.ckall[0].checked)
					t.ckall[0].checked = false;
				if(t.onFinish)
					$(t.onFinish(data));
				t._click_row();
			}// end add_data
		}
		t.init();
		g.t = t;
		g.st = st;
		t.getcondition();
		t.page_change(1);
	}

	var docloaded = false;
	$(document).ready(function() {
		docloaded = true;
	});

	$.fn.myeasygrid = function(settings) {
		return this.each(function() {
			if (!docloaded) {
				var g = this;
				$(document).ready(function() {
					$.addGrid(g, settings);
				});
			} else {
				$.addGrid(this, settings);
			}
		});
	};
})(jQuery);