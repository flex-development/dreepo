# dreepo

Repository Pattern implementation for Firebase Realtime Database

[![TypeScript](https://badgen.net/badge/-/typescript?icon=typescript&label)](https://www.typescriptlang.org/)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

## Overview

[Getting Started](#getting-started)  
[Installation](#installation)  
[Usage](#usage)  
[Built With](#built-with)  
[Contributing](docs/CONTRIBUTING.md)

## Getting Started

Inspired by [Fireorm][1], Dreepo exposes a Repository Pattern implementation for
[Firebase Realtime Database][2] instances.

Alongside an abstract database access layer, repositories also support:

- aggregation pipelines and queries using [mingo][3]
- model validation using [class-validator][4]

## Installation

1. Create or edit an `.npmrc` file with the following information:

   ```utf-8
   @flex-development:registry=https://npm.pkg.github.com/
   ```

2. Add project to `dependencies`

   ```zsh
   yarn add @flex-development/dreepo # or npm i @flex-development/dreepo
   ```

## Usage

[Configuration](#configuration)  
[Database Connection](#database-connection)  
[Modelling Entities](#modelling-entities)  
[Repository Options](#repository-options)  
[Creating a New Repository](#creating-a-new-repository)  
[Repository Cache](#repository-cache)  
[Repository Class API](#repository-class-api)

### Configuration

#### Firebase Service Account

Dreepo communicates with your Realtime Database using the [Firebase Database
REST API][2]. Generated by service accounts, [Google OAuth2 access tokens][5]
are used to authenticate requests.

1. Navigate to the [Service Accounts][6] section of the Firebase console

2. Click **Generate New Private Key** to generate a new service account key file

#### Environment Variables

- `DEBUG`: Toggle [debug][7] logs from the `dreepo` namespace
- `DEBUG_COLORS`: Toggle [debug][7] log namespace colors

#### Mingo

The `Repository` class integrates with [mingo][3], a MongoDB query language for
in-memory objects, to support aggregation pipelines and querying.

Operators loaded by Dreepo can be viewed in the [config](src/config/mingo.ts)
file. If additional operators are needed, you'll need to load them on your own
_before_ instantiating a new repository.

#### TypeScript

For shorter import paths, TypeScript users can add the following aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@dreepo": ["node_modules/@flex-development/dreepo/index"],
      "@dreepo/*": ["node_modules/@flex-development/dreepo/*"]
    }
  }
}
```

These aliases will be used in following code examples.

### Database Connection

Before creating a new repository, initialize a `RepoDBConnection` provider to
establish a connection between your database and repository.

```typescript
import { RepoDBConnection } from '@dreepo'

const path = 'cars'
const url = process.env.FIREBASE_DATABASE_URL || ''
const client_email = process.env.FIREBASE_CLIENT_EMAIL || ''
const private_key = process.env.FIREBASE_PRIVATE_KEY || ''

export const dbconn = new RepoDBConnection(path, url, client_email, private_key)
```

Note:

- An `Exception` will be thrown if any options are invalid
- Private keys will be formatted using `private_key.replace(/\\n/g, '\n')`

### Modelling Entities

Before instantiating a new repository, a model needs to be created.

For the next set of examples, the model `Car` will be used.

```typescript
import type { IEntity, QueryParams } from '@dreepo'
import { Entity } from '@dreepo'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export interface ICar extends IEntity {
  make: string
  model: string
  model_year: number
}

export type CarQuery = QueryParams<ICar>

export class Car extends Entity implements ICar {
  @IsString()
  @IsNotEmpty()
  make: ICar['make']

  @IsString()
  @IsNotEmpty()
  model: ICar['model']

  @IsNumber()
  model_year: ICar['model_year']
}
```

For more information about validation decorators, see the [class-validator][4]
package.

Dreepo also exposes a set of [custom decorators](src/decorators/index.ts).

### Repository Options

The `Repository` class accepts an `options` object that passes additional
options to [mingo][3] and [class-transformer-validator][4].

```typescript
import type { RepoOptionsDTO } from '@dreepo'

export const options: RepoOptionsDTO = {
  mingo: {},
  validation: {
    enabled: true,
    transformer: {},
    validator: {}
  }
}
```

Note that all properties are optional and will be merged with the following
options:

```typescript
import type { TVODefaults } from '@dreepo'

/**
 * @property {TVODefaults} TVO_DEFAULTS - `class-transformer-validator` options
 * @see https://github.com/MichalLytek/class-transformer-validator
 */
export const TVO_DEFAULTS: TVODefaults = Object.freeze({
  transformer: {},
  validator: {
    enableDebugMessages: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: false,
    validationError: { target: false, value: true },
    whitelist: true
  }
})
```

### Creating a New Repository

```typescript
import { Repository } from '@dreepo'

export const Cars = new Repository<ICar, CarQuery>(dbconn, Car, options)
```

### Repository Cache

After instantiation, before calling any repository methods, the repository's
cache must be refreshed to keep the database and repository cache in sync.

If the cache is empty before running an aggregation pipeline or executing a
search, a warning will be logged to the console.

Not refreshing the cache before a write operation (`create`, `patch`, or `save`)
could lead to accidental overwrites or other database inconsistencies.

```typescript
await Cars.refreshCache()
```

### Repository Class API

The `Repository` class allows users to perform CRUD operations on their Realtime
Database, as well as check values against the repository model schema.

Documentation can be viewed [here](src/repositories/repository.ts).

```typescript
/**
 * `Repository` class interface.
 *
 * @template E - Entity
 * @template P - Query parameters
 */
export interface IRepository<
  E extends IEntity = IEntity,
  P extends QueryParams<E> = QueryParams<E>
> {
  readonly cache: RepoCache<E>
  readonly dbconn: IRepoDBConnection
  readonly logger: Debugger
  readonly mingo: typeof mingo
  readonly model: EntityClass<E>
  readonly options: RepoOptions
  readonly validator: IRepoValidator<E>

  aggregate(
    pipeline?: OneOrMany<AggregationStages<E>>
  ): PartialOr<EntityEnhanced<E>>[] | RawArray
  clear(): Promise<boolean>
  create(dto: EntityDTO<E>): Promise<E>
  delete(id: OneOrMany<E['id']>, should_exist?: boolean): Promise<typeof id>
  find(params?: P): PartialOr<E>[]
  findByIds(ids: E['id'][], params?: P): PartialOr<E>[]
  findOne(id: E['id'], params?: P): PartialOr<E> | null
  findOneOrFail(id: E['id'], params?: P): PartialOr<E>
  patch(id: E['id'], dto: Partial<EntityDTO<E>>, rfields?: string[]): Promise<E>
  refreshCache(): Promise<RepoCache<E>>
  save(dto: OneOrMany<PartialOr<EntityDTO<E>>>): Promise<E[]>
}
```

## Built With

- [Axios][8] - Promise based HTTP client
- [Firebase Database REST API][2] - REST API for Firebase Realtime Database
- [Google Auth Library Node.js Client][9] - Node.js library for Google OAuth2
- [class-transformer-validator][10] - Plugin class-transformer/validator
- [class-transformer][11] - Convert plain objects to class instances
- [class-validator][4] - Decorator and non-decorator based validation
- [debug][9] - JavaScript debugging utility
- [mingo][3] - MongoDB query language for in-memory objects

[1]: https://github.com/wovalle/fireorm
[2]: https://firebase.google.com/docs/reference/rest/database
[3]: https://github.com/kofrasa/mingo
[4]: https://github.com/typestack/class-validator
[5]: https://developers.google.com/identity/protocols/oauth2
[6]:
  https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk
[7]: https://github.com/visionmedia/debug
[8]: https://github.com/axios/axios
[9]: https://github.com/googleapis/google-auth-library-nodejs
[10]: https://github.com/MichalLytek/class-transformer-validator
[11]: https://github.com/typestack/class-transformer
