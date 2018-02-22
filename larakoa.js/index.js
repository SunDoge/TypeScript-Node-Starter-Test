const Application = require('./lib/application');


const app = new Application();

app.router.get('/', async ctx => {
    ctx.body = JSON.stringify({
        'code': 'ok',
        'error': false,
        'payload': 'Hello World'
    });
});

app.router.get('/:name', 'test/controllers/test@index');
app.router.get('/fuck/:id', {
    as: 'fuck', fn: async ctx => {
        ctx.body = JSON.stringify({
            'code': 'ok',
            'error': false,
            'payload': ctx.app.router.url('fuck', 3)
        });
    }
});


app.useRouter();

app.listen(3000);

// const { Inject, ReflectiveInjector } = require('injection-js');

// class Http {
//     constructor() {
//         console.log('construct http');
//     }
// }

// class Service {
//     static get parameters() {
//         return [new Inject(Http)];
//     }

//     constructor(http) {
//         this.http = http;
//         console.log('construct service');
//     }
// }

// const injector = ReflectiveInjector.resolveAndCreate([Http, Service]);

// // console.log(injector.get(Service) instanceof Service);
// // console.log(injector.get(Service) instanceof Service);
// // console.log(injector.get(Service) instanceof Service);


