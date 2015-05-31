// JavaScript Document
var md5 = require('MD5');
	
// Функция для сортировки объектов
function sortObject(obj) {
    var sorted = {},
    key, a = [];
	
    for (key in obj) {
    	if (obj.hasOwnProperty(key)) { a.push(key); }
    }

    a.sort();

    for (key = 0; key < a.length; key++) {
    	sorted[a[key]] = obj[a[key]];
    }
    return sorted;
}

// Функция для формирования строки конкатенации
function make_concat_string( /* Объект с параметрами */ params, /* Имя скрипта */ script_name, /* Секретный ключ */ secret_key){
		
	// удаляем параметр с подписью - если есть
	delete params['sp_sig'];
	
	// генерируем только если ее не было передано в params (например при проверке на result)
	if(params['sp_salt'] == undefined){
		params['sp_salt'] = parseInt(Math.random()*10000000);
	}
	// инициализируем для конкатенации
	var concat_str = '';
	
	// сортируем параметры по ключам в алфавитном порядке
	var sorted_json = sortObject(params);
	
	// собираем строку для конкатенации
	for (key in sorted_json) {
    	if (sorted_json.hasOwnProperty(key)) {
			concat_str = concat_str + sorted_json[key]+';';
    	}
    }
	
	// добавляем в строку имя скрипта и секретный ключ
	concat_str = script_name+';'+concat_str+secret_key;
	
	return concat_str;
}

// Создание конечной хеш-подписи
function make_signature_string( /* Объект с параметрами */ params, /* Имя скрипта */ script_name, /* Секретный ключ */ secret_key){
	return md5(make_concat_string(params, script_name, secret_key));
}

// Создание GET-запроса к API
function make_payment_request( /* Объект с параметрами */ params, /* URL на который направляется запрос */ url, /* Секретный ключ */ secret_key){
	var script_name_parts = url.split('/');
	var script_name = script_name_parts[script_name_parts.length-1];
	
	var signature = make_signature_string(params, script_name, secret_key);
	
	// создаем массив с конечными параметрами
	var full_params = params;
	full_params['sp_sig'] = signature;
	
	// формируем query string
	var query_string = require('querystring').stringify(full_params);
	
	// возвращаем полный URL
	return url+'?'+query_string;
	
}

//
/// DEMO PAYMENT REQUEST
//

var outlet_id = 'your outlet id';
var secret_key = 'your secret key';
var request_url = 'https://api.simplepay.pro/sp/payment';

var params = {
	"sp_outlet_id": outlet_id,
	"sp_description": "TEST",
	"sp_amount": 10
}

// Формируем URL для оплаты
var url = make_payment_request(params, request_url, secret_key);

console.log(url);