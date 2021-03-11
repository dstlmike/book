const app = require('express')();
const ejs = require('ejs');
const fs = require('fs');
const socket = require('socket.io');

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/public');

app.use(require('express').static(__dirname + '/Public'));

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/create', (req, res) => {
	res.render('create/index');
});

app.get('/book/:name/:page', (req, res) => {
	if (req.params.name && req.params.page) {
		var json = JSON.parse(fs.readFileSync('./data.json').toString());
		if (!(req.params.name in json)) {
			res.status(404);
			res.render('errors/404response/index');
		} else {
			if (
				parseInt(req.params.page) > json[req.params.name]['pages'].length ||
				parseInt(req.params.page) < 1
			) {
				res.status(404);
				res.render('errors/404response/index');
			} else {
				res.render('book/index');
			}
		}
	}
});

app.get('/restrictions', (req, res) => {
	res.render('restrictions/index');
});

app.get('/json/:name', (req, res) => {
	if (req.params.name) {
		var json = JSON.parse(fs.readFileSync('./data.json').toString());
		if (!(req.params.name in json)) {
			res.status(404);
			res.render('errors/404response/index');
		} else if (req.params.name.toLowerCase() === 'books') {
			res.send(json);
		} else {
			res.send(json[req.params.name]);
		}
	}
});

// error handling (404)
app.use(function(req, res, next) {
	res.status(404);
	res.render('errors/404response/index');
});

const server = app.listen(8080, () => {
	console.log('Started server.');
});

// socket.io
const io = socket(server);
io.on('connection', function(socket) {
	console.log('A user connected.');

	// home
	socket.on('search', function(query) {
		var json = JSON.parse(fs.readFileSync('./data.json').toString());
		var results = [];
		for (const [key, val] of Object.entries(json)) {
			if (key == 'books') continue;
			if (json[key]['rtitle'].toLowerCase().includes(query.toLowerCase())) {
				results.push(json[key]['rtitle']);
			}
		}
		results.sort(function(a, b) {
			return a.localeCompare(b);
		});
		io.to(socket.id).emit('retquery', results.slice(0, 4));
	});

	// create
	socket.on('setbook', function(data) {
		var json = JSON.parse(fs.readFileSync('./data.json').toString());
		if (!(data.title in json)) {
			// dict handling
			json[data.title] = {};
			json[data.title]['pages'] = [];
			json[data.title]['res'] = '';
			json[data.title]['rtitle'] = data.rtitle;
			json = JSON.stringify(json);
			fs.writeFile('./data.json', json, err => {
				if (err) throw err;
				console.log('Done setting book!');
			});
		}
	});

	socket.on('addpage', function(data) {
		var json = JSON.parse(fs.readFileSync('./data.json').toString());
		json[data.title]['pages'].push(data.page);
		json = JSON.stringify(json);
		fs.writeFile('./data.json', json, err => {
			if (err) throw err;
			console.log('Added a page!');
		});
	});

	socket.on('setres', function(data) {
		var json = JSON.parse(fs.readFileSync('./data.json').toString());
		json[data.title]['res'] = data.res;
		json = JSON.stringify(json);
		fs.writeFile('./data.json', json, err => {
			if (err) throw err;
			console.log('Set the restriction!');
		});
	});

	socket.on('checkbook', function(book) {
		var json = JSON.parse(fs.readFileSync('./data.json').toString());
		io.to(socket.id).emit('checkbookret', !(book in json));
	});

	// book
	socket.on('grabdata', function(data) {
		var json = JSON.parse(fs.readFileSync('./data.json').toString());
		var sdata = {
			title: json[data.title]['rtitle'],
			content: json[data.title]['pages'][data.page - 1],
			res: json[data.title]['res'],
			next: json[data.title]['pages'].length !== data.page,
			prev: data.page !== 1
		};
		io.to(socket.id).emit('senddata', sdata);
	});
});
