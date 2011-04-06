jQuery(document).ready(function($) {
	
	// Initialize the sortable
	$('.cmspo-sortable').nestedSortable({
		forcePlaceholderSize: true,
		handle: 'div',
		helper:	'clone',
		items: 'li',
		opacity: .6,
		placeholder: 'placeholder',
		tabSize: 18,
		tolerance: 'pointer',
		toleranceElement: '> div',
		cursor: 'move',
		maxLevels: cmspo_maxLevels,
		revert: 80,
		update: function(event, ui) { saveTree(event, ui); }
	});
	
	// Save changes
	function saveTree(event, ui) {
		if ( typeof ui !== 'undefined' ) {
			$(ui.item).find('div').addClass('loading');
			order_data = $('.cmspo-sortable').nestedSortable('toArray');
			
			children = $(ui.item).parent('ol').children('li').length;
			$(ui.item).parent('ol').parent('li').children('.cmspo-page').children('.cmspo-count').text( '('+ children +')' );
		}
		else
			order_data = '';
		
		state_data = new Array();
		$.each( $('#cmspo-pages li ol:visible'), function() {
			if ( $(this).children('li').length ) {
				state_data.push( $(this).parent('li').attr('id').substr(5) );
			}
		});
		
		url = ajaxurl + '?action=save_tree&_ajax_nonce=' + _cmspo_ajax_nonce;
		$.ajax({
			type: 'POST',
			url: url,
			data: {
				order: order_data,
				open: state_data
			},
			success: function(data) {
				if ( typeof ui !== 'undefined' )
					$(ui.item).find('div').removeClass('loading');
				prependToggle();
			}
		});

	}
	
	// Remove labels
	$('.cmspo-state a').click(function() {
		label = $(this).parent();	
		$(label).parent().addClass('loading');
		url = ajaxurl + $(this).attr('href');
		$.ajax({
			type: 'POST',
			url: url,
			success: function(data, e) {
				$(label).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100).delay(180).animate({width:'toggle'}, 100);
				$(label).parent().removeClass('loading');
			},
			error: function() {
				$(label).parent().removeClass('loading');
				$(label).animate({left: '-9px'}, 90)
								.animate({left: '9px'}, 90)
								.animate({left: '0'}, 80);
			}
		});
		return false;
	});
	
	// Prepend toggle button
	function prependToggle() {
		$.each($('#cmspo-pages li'), function() {
			if ( $(this).children('div').children('.cmspo-toggle').length == 0 ) {				
				if ( $(this).children('ol').children('li').length > 0 ) {
					$(this).children('div').prepend('<span class="cmspo-toggle"><span></span></span>');
					$(this).children('div').find('.cmspo-toggle').click(function() {
							li = $(this).parent('div').parent('li');
							ol = li.children('ol');
							
							if ( ol.hasClass('cmspo-closed') || ol.css('display') == 'none' ) {
								expand(ol);
							} 
							else if ( ol.hasClass('cmspo-open') || ol.css('display') == 'block' ) {
								collapse(ol);
							}
					});
				}
			}
			else {
				if ( $(this).children('ol').children('li').length == 0 )	{
					$(this).children('div').find('.cmspo-toggle').remove();
				}
			}
		});
		
		childrens = $('#cmspo-pages li ol').has('li').length;
		
		if ( $('.cmspo-depth').length ) {
			div = $('.cmspo-depth');
			if (childrens == 0) {
				div.slideUp(400);
			} else {
				div.slideDown(400);
			}
		} else {
			if (childrens > 1) {
				$('.cmspo-actions').prepend('<div class="cmspo-depth"></div>');
				div = $('.cmspo-depth');
				div.hide();
				div.append('<a href="#" class="cmspo-collapse">'+cmspo.Collapse_all+'</a>', ' | <a href="#" class="cmspo-expand">'+cmspo.Expand_all+'</a>');
				$('.cmspo-expand').click(function() {
					expand( $('.cmspo-closed ol') );
					return false;
				});
				$('.cmspo-collapse').click(function() {
					collapse( $('#cmspo-pages ol').has('li:not(.cmspo-closed)') );
					return false;
				});
				div.show();
			}
		}
		
	}
	prependToggle();

	// Toggle functions
	function expand(ol) {
		li = ol.parent('li');
		ol.slideDown(100, function() {
			li.removeClass('cmspo-closed');
			li.addClass('cmspo-open');
		});
		saveTree();
	}
	function collapse(ol) {
		li = ol.parent('li');
		ol.slideUp(100, function() {
			li.removeClass('cmspo-open');
			li.addClass('cmspo-closed');
			saveTree();
		});
	}
	
});