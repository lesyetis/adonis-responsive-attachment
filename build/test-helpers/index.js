"use strict";
/*
 * @ndianabasi/adonis-responsive-attachment
 *
 * (c) Ndianabasi Udonkang <ndianabasi.udonkang@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanup = exports.setup = exports.setupApplication = exports.fs = void 0;
const path_1 = require("path");
const dev_utils_1 = require("@poppinss/dev-utils");
const standalone_1 = require("@adonisjs/core/build/standalone");
exports.fs = new dev_utils_1.Filesystem((0, path_1.join)(__dirname, '__app'));
/**
 * Setup AdonisJS application
 */
async function setupApplication(additionalProviders, environment = 'test') {
    await exports.fs.add('.env', ``);
    await exports.fs.add('config/app.ts', `
    export const appKey = 'zgkDRQ21_1uznZp33C4sIGj1XUuIeIJd',
    export const http = {
      cookie: {},
      trustProxy: () => true,
    }
  `);
    await exports.fs.add('config/bodyparser.ts', `
    const config = {
      whitelistedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
      json: {
        encoding: 'utf-8',
        limit: '1mb',
        strict: true,
        types: [
          'application/json',
        ],
      },
      form: {
        encoding: 'utf-8',
        limit: '1mb',
        queryString: {},
        types: ['application/x-www-form-urlencoded'],
      },
      raw: {
        encoding: 'utf-8',
        limit: '1mb',
        queryString: {},
        types: ['text/*'],
      },
      multipart: {
        autoProcess: true,
        convertEmptyStringsToNull: true,
        processManually: [],
        encoding: 'utf-8',
        maxFields: 1000,
        limit: '20mb',
        types: ['multipart/form-data'],
      },
    }

    export default config
  `);
    await exports.fs.add('config/drive.ts', `
    export const disk = 'local',
    export const disks = {
      local: {
        driver: 'local',
        visibility: 'private',
        root: '${(0, path_1.join)(exports.fs.basePath, 'uploads').replace(/\\/g, '/')}',
        serveFiles: true,
        basePath: '/uploads'
      }
    }
  `);
    await exports.fs.add('config/database.ts', `
    const MYSQL_VARIABLES = {
      MYSQL_HOST: 'localhost',
      MYSQL_PORT: 3306,
      MYSQL_USER: 'adonis',
      MYSQL_PASSWORD: 'IGj1XUuIeIJd',
      MYSQL_DB_NAME: 'adonis-responsive-attachment',
    };

    const databaseConfig = {
      connection: 'sqlite',
      connections: {
        sqlite: {
          client: 'sqlite3',
          connection: {
            filename: '${(0, path_1.join)(exports.fs.basePath, 'db.sqlite3').replace(/\\/g, '/')}',
          },
        },
        mysql: {
          client: 'mysql',
            connection: {
              host: MYSQL_VARIABLES.MYSQL_HOST,
              port: MYSQL_VARIABLES.MYSQL_PORT,
              user: MYSQL_VARIABLES.MYSQL_USER,
              password: MYSQL_VARIABLES.MYSQL_PASSWORD,
              database: MYSQL_VARIABLES.MYSQL_DB_NAME,
            },
            migrations: {
              naturalSort: true,
            },
            healthCheck: false,
            debug: false,
          },
        }
    }
    export default databaseConfig`);
    const app = new standalone_1.Application(exports.fs.basePath, environment, {
        providers: ['@adonisjs/core', '@adonisjs/lucid'].concat(additionalProviders || []),
    });
    await app.setup();
    await app.registerProviders();
    await app.bootProviders();
    return app;
}
exports.setupApplication = setupApplication;
/**
 * Create users table
 */
async function createUsersTable(client) {
    await client.schema.dropTableIfExists('users');
    await client.schema.createTable('users', (table) => {
        table.increments('id').notNullable().primary();
        table.string('username').notNullable().unique();
        table.json('avatar').nullable();
        table.string('cover_image').nullable();
    });
}
/**
 * Setup for tests
 */
async function setup(application) {
    const db = application.container.use('Adonis/Lucid/Database');
    await createUsersTable(db.connection());
}
exports.setup = setup;
/**
 * Performs cleanup
 */
async function cleanup(application) {
    const db = application.container.use('Adonis/Lucid/Database');
    await db.connection().schema.dropTableIfExists('users');
    await db.manager.closeAll();
    await exports.fs.cleanup();
}
exports.cleanup = cleanup;
