

function sm_cart_qty_change(itemid, e){


console.log('itemid:'+itemid);
console.log('e:'+e);



// If select
if (e == '') 
{ 
	var i_e = $("#sm-cart-select-"+itemid).val();		
	var button_c = $("#sm-button-add-to-cart-"+itemid);
	q = $('#sm-quantity-'+itemid).val();  
}
else
{
	var i_e = itemid+"_"+e;			
	var button_c = $("#sm-button-add-to-cart-"+i_e);
	q = $('#sm-quantity-'+i_e).val(); 
}

console.log(i_e);
console.log(q);


$.ajax({

        type:"POST",
        url:'/cart/process/check_item_in_cart.php',
        data:{'i_e':i_e, 'q':q },
        dataType: 'json',
        success:function(response){

							 console.log(response);
               if (response.success)
               {
               	if (response.qty == q)
               	{
               		console.log('view_cart');               		
               		$('#sm-cart-form-'+itemid).attr('action', '/cart/show_cart.php');
									button_c.removeClass('btn-3rd');
									button_c.addClass('btn-3rd-inv');									
									button_c.text('View in cart');
               	}
               	else
               	{         		
               		console.log('update_cart');
               		$('#sm-cart-form-'+itemid).attr('action', '/cart/process/update_item_in_cart.php');
									button_c.removeClass('btn-3rd');
									button_c.addClass('btn-3rd-inv');									
									button_c.text('Update cart');
								}			
             	 }
               else
               {
	             		console.log('add_cart');               	
	             		$('#sm-cart-form-'+itemid).attr('action', '/cart/add_cart.php');
									button_c.addClass('btn-3rd');
									button_c.removeClass('btn-3rd-inv');									
									button_c.text('Add to cart');							             
							 }
							 
								
        }
        
     })

}


function sm_cart_select_change(itemid){

var button_c = $("#sm-button-add-to-cart-"+itemid);
var i_e = $("#sm-cart-select-"+itemid).val();

console.log('itemid:'+itemid);
console.log('button_c:'+button_c);
console.log('i_e:'+i_e);

$.ajax({

        type:"POST",
        url:'/cart/process/check_item_in_cart.php',
        data:{'i_e':i_e },
        dataType: 'json',
        success:function(response){

							 console.log(response);
               if (response.success)
               {
               	console.log('show_cart');
               		$('#sm-cart-form-'+itemid).attr('action', '/cart/show_cart.php');
									button_c.removeClass('btn-3rd');
									button_c.addClass('btn-3rd-inv');									
									button_c.text('View in cart');			
             	 }
               else
               {
               	console.log('add_cart');               	
               		$('#sm-cart-form-'+itemid).attr('action', '/cart/add_cart.php');
									button_c.addClass('btn-3rd');
									button_c.removeClass('btn-3rd-inv');									
									button_c.text('Add to cart');							             
							 }
							 $("#sm-quantity-"+itemid).val(response.qty);
								
        }
        
     })

}



function sm_add_to_wishlist(button_id, customerid, itemid, manage_view){

var button_c = $("#"+button_id);

console.log(manage_view);

$.ajax({

        type:"POST",
        url:'/cart/process/add_wishlist.php',
        data:{'customerid':customerid, 'itemid':itemid },
        dataType: 'json',
        success:function(response){
               
               if (response.success)
               {
               	
               	 	if (manage_view)
               	 	{
               	 		$('#sm-ecomm-wishlist-item-card-'+itemid).fadeOut();
               	 	}

										button_c.toggleClass('btn-4th');
										button_c.toggleClass('btn-4th-inv');									
										button_c.toggleClass('wishlist_added');
										if(button_c.hasClass('wishlist_added')){
											button_c.text('Item in wish list');			
										} else {
											button_c.text('Add to wish list');
										}
									
             	 }
               else
               {
               	swal({
										  title: "Add to Wish List",
										  text: "Please create a new account or log in to an existing account in order to add this item to your wish list.<br>"+
										  			"<a href=\"/cart/account_create.php\"><button type=\"button\" class=\"btn btn-primary\">Create</button></a>"+
										  			"<a href=\"/cart/account_login.php\"><button type=\"button\" class=\"btn btn-primary\">Log in</button></a>"+
										  			"<a><button class=\"btn cancel\" tabindex=\"3\"><i class=\"icon-cross2\"></i> Close</button></a>",	  			
										  html: true, 
										  allowOutsideClick: true,
										  showConfirmButton: false,
										});	
								}
								
        }
        
     })

}



function sm_add_to_cart_not_available(){
	
               	swal({
										  title: "Currently Unavailable",
										  text: "We're sorry but this item is not available at the present time.<br>"+
										  			"",	  			
										  html: true, 
										  allowOutsideClick: true,
										  showConfirmButton: true
										});	
							
	
}
	








function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    }
  }
}



function fielderror(fieldname, fieldvalue, message)
{
 if (fieldname.value == fieldvalue)
 {
 	/*
		swal({
		  title: "",
		  text: message,
		  type: "info",
		  showCancelButton: false,
		  confirmButtonColor: "primary",
		  confirmButtonText: "Okay",
		  closeOnConfirm: false,
		  heightAuto: false
		});	
			*/
    fieldname.focus();
		toastr.options = {
		  "debug": false,
		  "positionClass": "toast-top-center",
		  "onclick": null,
		  "fadeIn": 300,
		  "fadeOut": 1000,
		  "timeOut": 7000,
		  "extendedTimeOut": 1000
		}    
    toastr["error"](message);
    return true;
 }


}

function fielderror_select(fieldname, fieldvalue, message, sectionid)
{	
 var num = document.querySelectorAll('input[name=\''+fieldname+'[]\']:checked').length;
 console.log('fielderror_select: '+fieldname+' '+sectionid);
 if (num <= 0)
 {
 	/*
		swal({
		  title: "",
		  text: message,
		  type: "info",
		  showCancelButton: false,
		  confirmButtonColor: "primary",
		  confirmButtonText: "Okay",
		  closeOnConfirm: false,
		  heightAuto: false
		});		
		*/
	
    document.getElementById(fieldname+'_div').scrollIntoView();
		window.scrollBy(0, -150); 

		toastr.options = {
		  "debug": false,
		  "positionClass": "toast-top-center",
		  "onclick": null,
		  "fadeIn": 300,
		  "fadeOut": 1000,
		  "timeOut": 5000,
		  "extendedTimeOut": 1000
		}    
    toastr["error"](message);
    return true;
 }


}


function breturn(address)
{
 document.location.href=address;
}






function cancel(str)
{
//alert(str);
//alert('http://<? echo str_replace("www.", "", $HTTP_HOST); ?>/admin/editor.php');
parent.frames['middle'].location.href = str;
}




function prompt_confirm(txt)
{
input_box=confirm("Are you sure that you want to delete this "+txt+"?");
if (input_box==true)
{
return 1;
}
else
{
return 0;
}

}


function prompt_confirm_2(txt)
{
input_box=confirm("Are you sure that you want to delete this "+txt+"?");
if (input_box==true)
{
return 0;
}
else
{
return 1;
}

}


function prompt_backup_load()
{
input_box=confirm("Loading this backup file will overwrite your existing website.  Are you sure that you want to continue?");
if (input_box==true)
{
return 1;
}
else
{
return 0;
}

}


function submit_window(form_name)
{
var w = 0, h = 0;

if (document.all) {
   /* the following is only available after onLoad */
   w = document.body.clientWidth;
   h = document.body.clientHeight;
}
else if (document.layers) {
   w = window.innerWidth;
   h = window.innerHeight;
}

var popW = 700, popH = 300;

var leftPos = (w-popW)/2, topPos = (h-popH)/2;

  _submit_window = window.open('','_submit_window','width='+popW+',height='+popH+',top='+topPos+',left='+leftPos+',scrollbars=yes,resizable=yes,location=no');
 form_name.submit();
}

function process_window(address)
{
var w = 0, h = 0;

if (document.all) {
   /* the following is only available after onLoad */
   w = document.body.clientWidth;
   h = document.body.clientHeight;
}
else if (document.layers) {
   w = window.innerWidth;
   h = window.innerHeight;
}

var popW = 300, popH = 200;

var leftPos = (w-popW)/2, topPos = (h-popH)/2;

  _process_window = window.open(address,'_process_window','width='+popW+',height='+popH+',top='+topPos+',left='+leftPos+',scrollbars=no,resizable=yes,location=yes');
}

function preview_window(address)
{
var w = 0, h = 0;

if (document.all) {
   /* the following is only available after onLoad */
   w = document.body.clientWidth;
   h = document.body.clientHeight;
}
else if (document.layers) {
   w = window.innerWidth;
   h = window.innerHeight;
}

var popW = 800, popH = 550;

var leftPos = (w-popW)/2, topPos = (h-popH)/2;

  _preview_window = window.open(address,'_preview_window','width='+popW+',height='+popH+',top='+topPos+',left='+leftPos+',scrollbars=yes,resizable=yes,location=yes');
}

function preview_site(address)
{
var w = 0, h = 0;

if (document.all) {
   /* the following is only available after onLoad */
   w = document.body.clientWidth;
   h = document.body.clientHeight;
}
else if (document.layers) {
   w = window.innerWidth;
   h = window.innerHeight;
}

var popW = 800, popH = 550;

var leftPos = (w-popW)/2, topPos = (h-popH)/2;

  _preview_site = window.open(address,'_preview_window','width='+popW+',height='+popH+',top='+topPos+',left='+leftPos+',status=yes,menubar=yes,toolbar=yes,scrollbars=yes,resizable=yes,location=yes');
}

function bulletin_attach_window(address)
{
var w = 0, h = 0;

if (document.all) {
   /* the following is only available after onLoad */
   w = document.body.clientWidth;
   h = document.body.clientHeight;
}
else if (document.layers) {
   w = window.innerWidth;
   h = window.innerHeight;
}

var popW = 700, popH = 300;

var leftPos = (w-popW)/2, topPos = (h-popH)/2;

  _bulletin_attach_window = window.open(address,'_bulletin_attach_window','width='+popW+',height='+popH+',top='+topPos+',left='+leftPos+',scrollbars=yes,resizable=yes,location=no');
}


function open_manual(address)
{
var w = 0, h = 0;

if (document.all) {
   /* the following is only available after onLoad */
   w = document.body.clientWidth;
   h = document.body.clientHeight;
}
else if (document.layers) {
   w = window.innerWidth;
   h = window.innerHeight;
}

var popW = 800, popH = 600;

var leftPos = (w-popW)/2, topPos = (h-popH)/2;

  _manual = window.open(address,'_manual','width='+popW+',height='+popH+',top='+topPos+',left='+leftPos+',status=no,menubar=no,toolbar=no,scrollbars=yes,resizable=yes,location=no');
}

function editor_window(form_name, str)
{
var w = 0, h = 0;

if (document.all) {
   /* the following is only available after onLoad */
   w = document.body.clientWidth;
   h = document.body.clientHeight;
}
else if (document.layers) {
   w = window.innerWidth;
   h = window.innerHeight;
}

var popW = 800, popH = 600;

var leftPos = (w-popW)/2, topPos = (h-popH)/2;

str2 = str;
//alert(str2);

 str = window.open('',str2,'width='+popW+',height='+popH+',top='+topPos+',left='+leftPos+',scrollbars=yes,resizable=yes,location=yes,status=yes,menubar=yes');
 form_name.submit();
}

function view_article(id)
{
  open_article('/article.php?id='+id);
}



function open_article(address)
{
var w = 0, h = 0;

if (document.all) {
   /* the following is only available after onLoad */
   w = document.body.clientWidth;
   h = document.body.clientHeight;
}
else if (document.layers) {
   w = window.innerWidth;
   h = window.innerHeight;
}

var popW = 700, popH = 640;

var leftPos = (w-popW)/2, topPos = (h-popH)/2;

  _article = window.open(address,'_article_window','width='+popW+',height='+popH+',top='+topPos+',left='+leftPos+',status=yes,menubar=yes,toolbar=yes,scrollbars=yes,resizable=yes,location=no');
}


function openWin(img, popW, popH) {

var w = 0, h = 0;

if (document.all) {
   /* the following is only available after onLoad */
   w = document.body.clientWidth;
   h = document.body.clientHeight;
}
else if (document.layers) {
   w = window.innerWidth;
   h = window.innerHeight;
}

popW = parseInt(popW) + 25;
popH = parseInt(popH) + 25;


var leftPos = (w-popW)/2, topPos = (h-popH)/2;

  winId = window.open('','newwin','width='+popW+',height='+popH+',top='+topPos+',left='+leftPos+',scrollbars=yes,resizable=yes');
  if (winId)
  {
    winId.innerWidth = popW;
    winId.innerHeight = popH;
 //   winId.resizeTo(popW, popH);
  }
//  winId = window.open('','newwin','width='+w+',height='+h+'top='+topPos+',left='+leftPos+');
  winId.document.write('<body topmargin="0" leftmargin="0" bottommargin="0" rightmargin="0" marginwidth="0" marginheight="0" onLoad="if (window.focus) window.focus()"><center>');
  winId.document.write('<a href="#" onclick="window.close(); return false"><img border="0" src="' + img + '"></a>');
  winId.document.write('</center></body>');
  winId.document.close();
}

function preview_title_font(fontname, text, shadow)
{
preview_template_font('/admin/font_preview.php?fontname='+fontname);

}


function preview_template_font(address)
{
var w = 0, h = 0;

if (document.all) {
   /* the following is only available after onLoad */
   w = document.body.clientWidth;
   h = document.body.clientHeight;
}
else if (document.layers) {
   w = window.innerWidth;
   h = window.innerHeight;
}

var popW = 450, popH = 200;

var leftPos = (w-popW)/2, topPos = (h-popH)/2;

  _preview_template_font_window = window.open(address,'_preview_template_font_window','width='+popW+',height='+popH+',top='+topPos+',left='+leftPos+',scrollbars=no,resizable=no,location=no');
}


function calendar_window(form_name)
{
var w = 0, h = 0;

if (document.all) {
   /* the following is only available after onLoad */
   w = document.body.clientWidth;
   h = document.body.clientHeight;
}
else if (document.layers) {
   w = window.innerWidth;
   h = window.innerHeight;
}

var popW = 800, popH = (screen.availHeight - 150);

var leftPos = (w-popW)/2, topPos = (h-popH)/2;

  _month_edit = window.open('','_month_edit','width='+popW+',height='+popH+',top='+topPos+',left='+leftPos+',location=yes,toolbar=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes,location=no');
 form_name.submit();
}




function printing_instructions_window(address)
{
var w = 0, h = 0;

if (document.all) {
   /* the following is only available after onLoad */
   w = document.body.clientWidth;
   h = document.body.clientHeight;
}
else if (document.layers) {
   w = window.innerWidth;
   h = window.innerHeight;
}

var popW = 400, popH = 300;

var leftPos = (w-popW)/2, topPos = (h-popH)/2;

  _printing_instructions_window = window.open(address,'_printing_instructions_window','width='+popW+',height='+popH+',top='+topPos+',left='+leftPos+',scrollbars=no,resizable=yes,location=no');
}



function download_hash_window(address)
{
var w = 0, h = 0;

if (document.all) {
   /* the following is only available after onLoad */
   w = document.body.clientWidth;
   h = document.body.clientHeight;
}
else if (document.layers) {
   w = window.innerWidth;
   h = window.innerHeight;
}

var popW = 750, popH = 300;

var leftPos = (w-popW)/2, topPos = (h-popH)/2;

  _download_hash_window = window.open(address,'_download_hash_window','width='+popW+',height='+popH+',top='+topPos+',left='+leftPos+',scrollbars=no,resizable=yes,location=no');
}





function slideshow_window(address)
{
var w = 0, h = 0;

if (document.all) {
   /* the following is only available after onLoad */
   w = document.body.clientWidth;
   h = document.body.clientHeight;
}
else if (document.layers) {
   w = window.innerWidth;
   h = window.innerHeight;
}

var popW = 980, popH = 800;

var leftPos = (w-popW)/2, topPos = (h-popH)/2;

  _slideshow_window = window.open(address,'_sv_window','width='+popW+',height='+popH+',top='+topPos+',left='+leftPos+',scrollbars=yes,resizable=yes,location=no');
}



function open_receipt(address)
{
var w = 0, h = 0;

if (document.all) {
   /* the following is only available after onLoad */
   w = document.body.clientWidth;
   h = document.body.clientHeight;
}
else if (document.layers) {
   w = window.innerWidth;
   h = window.innerHeight;
}

var popW = 800, popH = 600;

var leftPos = (w-popW)/2, topPos = (h-popH)/2;

  _receipt = window.open(address,'_receipt','width='+popW+',height='+popH+',top='+topPos+',left='+leftPos+',status=yes,menubar=yes,toolbar=yes,scrollbars=yes,resizable=yes,location=no');
}



function afr_player_window(address)
{
var w = 0, h = 0;

if (document.all) {
   /* the following is only available after onLoad */
   w = document.body.clientWidth;
   h = document.body.clientHeight;
}
else if (document.layers) {
   w = window.innerWidth;
   h = window.innerHeight;
}

var popW = 300, popH = 300;

var leftPos = (w-popW)/2, topPos = (h-popH)/2;

  _afr_player_window = window.open(address,'_afr_player_window','width='+popW+',height='+popH+',top='+topPos+',left='+leftPos+',location=no,toolbar=no,status=no,menubar=no,scrollbars=no,resizable=no,location=no');

}


	
	
function CheckDecimal_paypal_recurring(inputtxt)   
{   
var decimal=  /^[-+]?[0-9]+\.[0-9]+$/;   
if(inputtxt.value.match(decimal))   
{     
return true;  
}  
else  
{   
alert('Please enter the amount of your recurring donation in the following format: X.XX')  
return false;  
}  
} 





function process_form_submit_paypal_recurring(f)
{

 if (fielderror(f.a3, "", "Please enter the amount of the donation."))
 {
   return false;
 }
 
 if (fielderror(f.a3, "0.00", "Please enter the amount of the donation."))
 {
   return false;
 } 
 
 if (fielderror(f.frequency, "", "Please select the frequency of the donation."))
 {
   return false;
 } 
 if (fielderror(f.termination, "", "Please select the term in which to continue the donation."))
 {
   return false;
 } 
 /*
 if (!CheckDecimal_paypal_recurring(f.a3))
 {
 		return false;
 }
 */
 
 
 if (f.frequency.value == "Once")
 {
 	f.p3.value = 1;
  f.t3.value = 'D';	
  f.src.value = 0;	
  f.item_name.value = "One-time Donation";  	  
 }
 if (f.frequency.value == "Weekly")
 {
 	f.p3.value = 1;
  f.t3.value = 'W';		
  f.src.value = 1;	
  if (f.termination.value == "1-year")
  	f.srt.value = 52;
  f.item_name.value = "Recurring Weekly Donation";  	    
 } 
 if (f.frequency.value == "Monthly")
 {
 	f.p3.value = 1;
  f.t3.value = 'M';		
  f.src.value = 1;	
  if (f.termination.value == "1-year")
  	f.srt.value = 12;  
  f.item_name.value = "Recurring Monthly Donation";  	  
 } 
 if (f.frequency.value == "Annually")
 {
 	f.p3.value = 1;
  f.t3.value = 'Y';	
  f.src.value = 1;
  if (f.termination.value == "1-year")
  	f.srt.value = 1;  	
  f.item_name.value = "Recurring Annual Donation";  	
 }   

   
}	
	



function load_monthly_calendar_section(my, sectionid)
{
    $.ajax({
        url : '/calendar/load_month.php',
        data:{"my":my, "sectionid":sectionid},
        type: 'GET',

        success: function(data){
            $('#'+sectionid).html(data);
        },
        cache: false
    });
}


