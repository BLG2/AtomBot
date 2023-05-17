const ModuleHolder = require('./ModuleHolder');
const moduleHolder = new ModuleHolder();

module.exports = class Express {
  App;
  constructor() {
    this.App = moduleHolder.Modules.express();
    this.App.use(moduleHolder.Modules.bodyParser.raw());
    this.App.use(moduleHolder.Modules.bodyParser.urlencoded({ extended: false }));
    this.App.use(moduleHolder.Modules.bodyParser.json());
  }

  /**
  * @param {String} path
  */
  async SetStaticPath(path) {
    this.App.use(express.static(moduleHolder.Modules.path.join(__dirname, path)));
  }

  /**
  * @param {Number} port
  */
  async StartExpress(port) {
    this.App.listen(port, () => {
      console.log(`http://localhost:${port}/`)
    });
  }

  async MaxSendLimit() {
    this.App.use(bodyParser.json({ limit: '100mb' }));
    this.App.use(bodyParser.urlencoded({
      limit: '100mb',
      extended: true,
      parameterLimit: 50000
    }));
    this.App.use(express.json({ limit: '100mb' }));
    this.App.use(express.urlencoded({ limit: '100mb' }));
  }


}
