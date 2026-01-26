
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Tenant
 * 
 */
export type Tenant = $Result.DefaultSelection<Prisma.$TenantPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Client
 * 
 */
export type Client = $Result.DefaultSelection<Prisma.$ClientPayload>
/**
 * Model Package
 * 
 */
export type Package = $Result.DefaultSelection<Prisma.$PackagePayload>
/**
 * Model PackageAddon
 * 
 */
export type PackageAddon = $Result.DefaultSelection<Prisma.$PackageAddonPayload>
/**
 * Model Shoot
 * 
 */
export type Shoot = $Result.DefaultSelection<Prisma.$ShootPayload>
/**
 * Model ShotList
 * 
 */
export type ShotList = $Result.DefaultSelection<Prisma.$ShotListPayload>
/**
 * Model Gallery
 * 
 */
export type Gallery = $Result.DefaultSelection<Prisma.$GalleryPayload>
/**
 * Model GalleryPhoto
 * 
 */
export type GalleryPhoto = $Result.DefaultSelection<Prisma.$GalleryPhotoPayload>
/**
 * Model Invoice
 * 
 */
export type Invoice = $Result.DefaultSelection<Prisma.$InvoicePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const PackageStatus: {
  INQUIRY: 'INQUIRY',
  QUOTE_SENT: 'QUOTE_SENT',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export type PackageStatus = (typeof PackageStatus)[keyof typeof PackageStatus]


export const ShotListStatus: {
  DRAFT: 'DRAFT',
  FINALIZED: 'FINALIZED',
  COMPLETED: 'COMPLETED'
};

export type ShotListStatus = (typeof ShotListStatus)[keyof typeof ShotListStatus]


export const GalleryStatus: {
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  DELIVERED: 'DELIVERED'
};

export type GalleryStatus = (typeof GalleryStatus)[keyof typeof GalleryStatus]


export const InvoiceStatus: {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED'
};

export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus]

}

export type PackageStatus = $Enums.PackageStatus

export const PackageStatus: typeof $Enums.PackageStatus

export type ShotListStatus = $Enums.ShotListStatus

export const ShotListStatus: typeof $Enums.ShotListStatus

export type GalleryStatus = $Enums.GalleryStatus

export const GalleryStatus: typeof $Enums.GalleryStatus

export type InvoiceStatus = $Enums.InvoiceStatus

export const InvoiceStatus: typeof $Enums.InvoiceStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Tenants
 * const tenants = await prisma.tenant.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Tenants
   * const tenants = await prisma.tenant.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.tenant`: Exposes CRUD operations for the **Tenant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tenants
    * const tenants = await prisma.tenant.findMany()
    * ```
    */
  get tenant(): Prisma.TenantDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.client`: Exposes CRUD operations for the **Client** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Clients
    * const clients = await prisma.client.findMany()
    * ```
    */
  get client(): Prisma.ClientDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.package`: Exposes CRUD operations for the **Package** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Packages
    * const packages = await prisma.package.findMany()
    * ```
    */
  get package(): Prisma.PackageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.packageAddon`: Exposes CRUD operations for the **PackageAddon** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PackageAddons
    * const packageAddons = await prisma.packageAddon.findMany()
    * ```
    */
  get packageAddon(): Prisma.PackageAddonDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.shoot`: Exposes CRUD operations for the **Shoot** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Shoots
    * const shoots = await prisma.shoot.findMany()
    * ```
    */
  get shoot(): Prisma.ShootDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.shotList`: Exposes CRUD operations for the **ShotList** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ShotLists
    * const shotLists = await prisma.shotList.findMany()
    * ```
    */
  get shotList(): Prisma.ShotListDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.gallery`: Exposes CRUD operations for the **Gallery** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Galleries
    * const galleries = await prisma.gallery.findMany()
    * ```
    */
  get gallery(): Prisma.GalleryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.galleryPhoto`: Exposes CRUD operations for the **GalleryPhoto** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GalleryPhotos
    * const galleryPhotos = await prisma.galleryPhoto.findMany()
    * ```
    */
  get galleryPhoto(): Prisma.GalleryPhotoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.invoice`: Exposes CRUD operations for the **Invoice** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Invoices
    * const invoices = await prisma.invoice.findMany()
    * ```
    */
  get invoice(): Prisma.InvoiceDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.3.0
   * Query Engine version: 9d6ad21cbbceab97458517b147a6a09ff43aa735
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Tenant: 'Tenant',
    User: 'User',
    Client: 'Client',
    Package: 'Package',
    PackageAddon: 'PackageAddon',
    Shoot: 'Shoot',
    ShotList: 'ShotList',
    Gallery: 'Gallery',
    GalleryPhoto: 'GalleryPhoto',
    Invoice: 'Invoice'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "tenant" | "user" | "client" | "package" | "packageAddon" | "shoot" | "shotList" | "gallery" | "galleryPhoto" | "invoice"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Tenant: {
        payload: Prisma.$TenantPayload<ExtArgs>
        fields: Prisma.TenantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TenantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TenantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findFirst: {
            args: Prisma.TenantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TenantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          findMany: {
            args: Prisma.TenantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          create: {
            args: Prisma.TenantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          createMany: {
            args: Prisma.TenantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TenantCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          delete: {
            args: Prisma.TenantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          update: {
            args: Prisma.TenantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          deleteMany: {
            args: Prisma.TenantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TenantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TenantUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>[]
          }
          upsert: {
            args: Prisma.TenantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TenantPayload>
          }
          aggregate: {
            args: Prisma.TenantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTenant>
          }
          groupBy: {
            args: Prisma.TenantGroupByArgs<ExtArgs>
            result: $Utils.Optional<TenantGroupByOutputType>[]
          }
          count: {
            args: Prisma.TenantCountArgs<ExtArgs>
            result: $Utils.Optional<TenantCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Client: {
        payload: Prisma.$ClientPayload<ExtArgs>
        fields: Prisma.ClientFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClientFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClientFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          findFirst: {
            args: Prisma.ClientFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClientFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          findMany: {
            args: Prisma.ClientFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>[]
          }
          create: {
            args: Prisma.ClientCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          createMany: {
            args: Prisma.ClientCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClientCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>[]
          }
          delete: {
            args: Prisma.ClientDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          update: {
            args: Prisma.ClientUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          deleteMany: {
            args: Prisma.ClientDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClientUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ClientUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>[]
          }
          upsert: {
            args: Prisma.ClientUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClientPayload>
          }
          aggregate: {
            args: Prisma.ClientAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateClient>
          }
          groupBy: {
            args: Prisma.ClientGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClientGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClientCountArgs<ExtArgs>
            result: $Utils.Optional<ClientCountAggregateOutputType> | number
          }
        }
      }
      Package: {
        payload: Prisma.$PackagePayload<ExtArgs>
        fields: Prisma.PackageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PackageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PackageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload>
          }
          findFirst: {
            args: Prisma.PackageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PackageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload>
          }
          findMany: {
            args: Prisma.PackageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload>[]
          }
          create: {
            args: Prisma.PackageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload>
          }
          createMany: {
            args: Prisma.PackageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PackageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload>[]
          }
          delete: {
            args: Prisma.PackageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload>
          }
          update: {
            args: Prisma.PackageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload>
          }
          deleteMany: {
            args: Prisma.PackageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PackageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PackageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload>[]
          }
          upsert: {
            args: Prisma.PackageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackagePayload>
          }
          aggregate: {
            args: Prisma.PackageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePackage>
          }
          groupBy: {
            args: Prisma.PackageGroupByArgs<ExtArgs>
            result: $Utils.Optional<PackageGroupByOutputType>[]
          }
          count: {
            args: Prisma.PackageCountArgs<ExtArgs>
            result: $Utils.Optional<PackageCountAggregateOutputType> | number
          }
        }
      }
      PackageAddon: {
        payload: Prisma.$PackageAddonPayload<ExtArgs>
        fields: Prisma.PackageAddonFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PackageAddonFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageAddonPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PackageAddonFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageAddonPayload>
          }
          findFirst: {
            args: Prisma.PackageAddonFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageAddonPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PackageAddonFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageAddonPayload>
          }
          findMany: {
            args: Prisma.PackageAddonFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageAddonPayload>[]
          }
          create: {
            args: Prisma.PackageAddonCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageAddonPayload>
          }
          createMany: {
            args: Prisma.PackageAddonCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PackageAddonCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageAddonPayload>[]
          }
          delete: {
            args: Prisma.PackageAddonDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageAddonPayload>
          }
          update: {
            args: Prisma.PackageAddonUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageAddonPayload>
          }
          deleteMany: {
            args: Prisma.PackageAddonDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PackageAddonUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PackageAddonUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageAddonPayload>[]
          }
          upsert: {
            args: Prisma.PackageAddonUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PackageAddonPayload>
          }
          aggregate: {
            args: Prisma.PackageAddonAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePackageAddon>
          }
          groupBy: {
            args: Prisma.PackageAddonGroupByArgs<ExtArgs>
            result: $Utils.Optional<PackageAddonGroupByOutputType>[]
          }
          count: {
            args: Prisma.PackageAddonCountArgs<ExtArgs>
            result: $Utils.Optional<PackageAddonCountAggregateOutputType> | number
          }
        }
      }
      Shoot: {
        payload: Prisma.$ShootPayload<ExtArgs>
        fields: Prisma.ShootFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ShootFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShootPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ShootFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShootPayload>
          }
          findFirst: {
            args: Prisma.ShootFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShootPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ShootFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShootPayload>
          }
          findMany: {
            args: Prisma.ShootFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShootPayload>[]
          }
          create: {
            args: Prisma.ShootCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShootPayload>
          }
          createMany: {
            args: Prisma.ShootCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ShootCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShootPayload>[]
          }
          delete: {
            args: Prisma.ShootDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShootPayload>
          }
          update: {
            args: Prisma.ShootUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShootPayload>
          }
          deleteMany: {
            args: Prisma.ShootDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ShootUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ShootUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShootPayload>[]
          }
          upsert: {
            args: Prisma.ShootUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShootPayload>
          }
          aggregate: {
            args: Prisma.ShootAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateShoot>
          }
          groupBy: {
            args: Prisma.ShootGroupByArgs<ExtArgs>
            result: $Utils.Optional<ShootGroupByOutputType>[]
          }
          count: {
            args: Prisma.ShootCountArgs<ExtArgs>
            result: $Utils.Optional<ShootCountAggregateOutputType> | number
          }
        }
      }
      ShotList: {
        payload: Prisma.$ShotListPayload<ExtArgs>
        fields: Prisma.ShotListFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ShotListFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShotListPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ShotListFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShotListPayload>
          }
          findFirst: {
            args: Prisma.ShotListFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShotListPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ShotListFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShotListPayload>
          }
          findMany: {
            args: Prisma.ShotListFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShotListPayload>[]
          }
          create: {
            args: Prisma.ShotListCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShotListPayload>
          }
          createMany: {
            args: Prisma.ShotListCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ShotListCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShotListPayload>[]
          }
          delete: {
            args: Prisma.ShotListDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShotListPayload>
          }
          update: {
            args: Prisma.ShotListUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShotListPayload>
          }
          deleteMany: {
            args: Prisma.ShotListDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ShotListUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ShotListUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShotListPayload>[]
          }
          upsert: {
            args: Prisma.ShotListUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ShotListPayload>
          }
          aggregate: {
            args: Prisma.ShotListAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateShotList>
          }
          groupBy: {
            args: Prisma.ShotListGroupByArgs<ExtArgs>
            result: $Utils.Optional<ShotListGroupByOutputType>[]
          }
          count: {
            args: Prisma.ShotListCountArgs<ExtArgs>
            result: $Utils.Optional<ShotListCountAggregateOutputType> | number
          }
        }
      }
      Gallery: {
        payload: Prisma.$GalleryPayload<ExtArgs>
        fields: Prisma.GalleryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GalleryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GalleryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPayload>
          }
          findFirst: {
            args: Prisma.GalleryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GalleryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPayload>
          }
          findMany: {
            args: Prisma.GalleryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPayload>[]
          }
          create: {
            args: Prisma.GalleryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPayload>
          }
          createMany: {
            args: Prisma.GalleryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GalleryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPayload>[]
          }
          delete: {
            args: Prisma.GalleryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPayload>
          }
          update: {
            args: Prisma.GalleryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPayload>
          }
          deleteMany: {
            args: Prisma.GalleryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GalleryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GalleryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPayload>[]
          }
          upsert: {
            args: Prisma.GalleryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPayload>
          }
          aggregate: {
            args: Prisma.GalleryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGallery>
          }
          groupBy: {
            args: Prisma.GalleryGroupByArgs<ExtArgs>
            result: $Utils.Optional<GalleryGroupByOutputType>[]
          }
          count: {
            args: Prisma.GalleryCountArgs<ExtArgs>
            result: $Utils.Optional<GalleryCountAggregateOutputType> | number
          }
        }
      }
      GalleryPhoto: {
        payload: Prisma.$GalleryPhotoPayload<ExtArgs>
        fields: Prisma.GalleryPhotoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GalleryPhotoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPhotoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GalleryPhotoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPhotoPayload>
          }
          findFirst: {
            args: Prisma.GalleryPhotoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPhotoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GalleryPhotoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPhotoPayload>
          }
          findMany: {
            args: Prisma.GalleryPhotoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPhotoPayload>[]
          }
          create: {
            args: Prisma.GalleryPhotoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPhotoPayload>
          }
          createMany: {
            args: Prisma.GalleryPhotoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GalleryPhotoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPhotoPayload>[]
          }
          delete: {
            args: Prisma.GalleryPhotoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPhotoPayload>
          }
          update: {
            args: Prisma.GalleryPhotoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPhotoPayload>
          }
          deleteMany: {
            args: Prisma.GalleryPhotoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GalleryPhotoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.GalleryPhotoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPhotoPayload>[]
          }
          upsert: {
            args: Prisma.GalleryPhotoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GalleryPhotoPayload>
          }
          aggregate: {
            args: Prisma.GalleryPhotoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGalleryPhoto>
          }
          groupBy: {
            args: Prisma.GalleryPhotoGroupByArgs<ExtArgs>
            result: $Utils.Optional<GalleryPhotoGroupByOutputType>[]
          }
          count: {
            args: Prisma.GalleryPhotoCountArgs<ExtArgs>
            result: $Utils.Optional<GalleryPhotoCountAggregateOutputType> | number
          }
        }
      }
      Invoice: {
        payload: Prisma.$InvoicePayload<ExtArgs>
        fields: Prisma.InvoiceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InvoiceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InvoiceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>
          }
          findFirst: {
            args: Prisma.InvoiceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InvoiceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>
          }
          findMany: {
            args: Prisma.InvoiceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>[]
          }
          create: {
            args: Prisma.InvoiceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>
          }
          createMany: {
            args: Prisma.InvoiceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InvoiceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>[]
          }
          delete: {
            args: Prisma.InvoiceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>
          }
          update: {
            args: Prisma.InvoiceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>
          }
          deleteMany: {
            args: Prisma.InvoiceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InvoiceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InvoiceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>[]
          }
          upsert: {
            args: Prisma.InvoiceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InvoicePayload>
          }
          aggregate: {
            args: Prisma.InvoiceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInvoice>
          }
          groupBy: {
            args: Prisma.InvoiceGroupByArgs<ExtArgs>
            result: $Utils.Optional<InvoiceGroupByOutputType>[]
          }
          count: {
            args: Prisma.InvoiceCountArgs<ExtArgs>
            result: $Utils.Optional<InvoiceCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    tenant?: TenantOmit
    user?: UserOmit
    client?: ClientOmit
    package?: PackageOmit
    packageAddon?: PackageAddonOmit
    shoot?: ShootOmit
    shotList?: ShotListOmit
    gallery?: GalleryOmit
    galleryPhoto?: GalleryPhotoOmit
    invoice?: InvoiceOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type TenantCountOutputType
   */

  export type TenantCountOutputType = {
    users: number
    packages: number
    shoots: number
    shotLists: number
    galleries: number
    clients: number
    invoices: number
  }

  export type TenantCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | TenantCountOutputTypeCountUsersArgs
    packages?: boolean | TenantCountOutputTypeCountPackagesArgs
    shoots?: boolean | TenantCountOutputTypeCountShootsArgs
    shotLists?: boolean | TenantCountOutputTypeCountShotListsArgs
    galleries?: boolean | TenantCountOutputTypeCountGalleriesArgs
    clients?: boolean | TenantCountOutputTypeCountClientsArgs
    invoices?: boolean | TenantCountOutputTypeCountInvoicesArgs
  }

  // Custom InputTypes
  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TenantCountOutputType
     */
    select?: TenantCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountUsersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountPackagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PackageWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountShootsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShootWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountShotListsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShotListWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountGalleriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GalleryWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountClientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClientWhereInput
  }

  /**
   * TenantCountOutputType without action
   */
  export type TenantCountOutputTypeCountInvoicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InvoiceWhereInput
  }


  /**
   * Count Type ClientCountOutputType
   */

  export type ClientCountOutputType = {
    packages: number
    invoices: number
  }

  export type ClientCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    packages?: boolean | ClientCountOutputTypeCountPackagesArgs
    invoices?: boolean | ClientCountOutputTypeCountInvoicesArgs
  }

  // Custom InputTypes
  /**
   * ClientCountOutputType without action
   */
  export type ClientCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClientCountOutputType
     */
    select?: ClientCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ClientCountOutputType without action
   */
  export type ClientCountOutputTypeCountPackagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PackageWhereInput
  }

  /**
   * ClientCountOutputType without action
   */
  export type ClientCountOutputTypeCountInvoicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InvoiceWhereInput
  }


  /**
   * Count Type PackageCountOutputType
   */

  export type PackageCountOutputType = {
    shoots: number
    addons: number
    invoices: number
    shotLists: number
  }

  export type PackageCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    shoots?: boolean | PackageCountOutputTypeCountShootsArgs
    addons?: boolean | PackageCountOutputTypeCountAddonsArgs
    invoices?: boolean | PackageCountOutputTypeCountInvoicesArgs
    shotLists?: boolean | PackageCountOutputTypeCountShotListsArgs
  }

  // Custom InputTypes
  /**
   * PackageCountOutputType without action
   */
  export type PackageCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageCountOutputType
     */
    select?: PackageCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PackageCountOutputType without action
   */
  export type PackageCountOutputTypeCountShootsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShootWhereInput
  }

  /**
   * PackageCountOutputType without action
   */
  export type PackageCountOutputTypeCountAddonsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PackageAddonWhereInput
  }

  /**
   * PackageCountOutputType without action
   */
  export type PackageCountOutputTypeCountInvoicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InvoiceWhereInput
  }

  /**
   * PackageCountOutputType without action
   */
  export type PackageCountOutputTypeCountShotListsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShotListWhereInput
  }


  /**
   * Count Type ShootCountOutputType
   */

  export type ShootCountOutputType = {
    galleries: number
  }

  export type ShootCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    galleries?: boolean | ShootCountOutputTypeCountGalleriesArgs
  }

  // Custom InputTypes
  /**
   * ShootCountOutputType without action
   */
  export type ShootCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShootCountOutputType
     */
    select?: ShootCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ShootCountOutputType without action
   */
  export type ShootCountOutputTypeCountGalleriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GalleryWhereInput
  }


  /**
   * Count Type GalleryCountOutputType
   */

  export type GalleryCountOutputType = {
    photos: number
  }

  export type GalleryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    photos?: boolean | GalleryCountOutputTypeCountPhotosArgs
  }

  // Custom InputTypes
  /**
   * GalleryCountOutputType without action
   */
  export type GalleryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GalleryCountOutputType
     */
    select?: GalleryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GalleryCountOutputType without action
   */
  export type GalleryCountOutputTypeCountPhotosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GalleryPhotoWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Tenant
   */

  export type AggregateTenant = {
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  export type TenantMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    plan: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    plan: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TenantCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    plan: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TenantMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    plan?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    plan?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TenantCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    plan?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TenantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenant to aggregate.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tenants
    **/
    _count?: true | TenantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TenantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TenantMaxAggregateInputType
  }

  export type GetTenantAggregateType<T extends TenantAggregateArgs> = {
        [P in keyof T & keyof AggregateTenant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTenant[P]>
      : GetScalarType<T[P], AggregateTenant[P]>
  }




  export type TenantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TenantWhereInput
    orderBy?: TenantOrderByWithAggregationInput | TenantOrderByWithAggregationInput[]
    by: TenantScalarFieldEnum[] | TenantScalarFieldEnum
    having?: TenantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TenantCountAggregateInputType | true
    _min?: TenantMinAggregateInputType
    _max?: TenantMaxAggregateInputType
  }

  export type TenantGroupByOutputType = {
    id: string
    name: string
    slug: string
    plan: string
    createdAt: Date
    updatedAt: Date
    _count: TenantCountAggregateOutputType | null
    _min: TenantMinAggregateOutputType | null
    _max: TenantMaxAggregateOutputType | null
  }

  type GetTenantGroupByPayload<T extends TenantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TenantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TenantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TenantGroupByOutputType[P]>
            : GetScalarType<T[P], TenantGroupByOutputType[P]>
        }
      >
    >


  export type TenantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    plan?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    users?: boolean | Tenant$usersArgs<ExtArgs>
    packages?: boolean | Tenant$packagesArgs<ExtArgs>
    shoots?: boolean | Tenant$shootsArgs<ExtArgs>
    shotLists?: boolean | Tenant$shotListsArgs<ExtArgs>
    galleries?: boolean | Tenant$galleriesArgs<ExtArgs>
    clients?: boolean | Tenant$clientsArgs<ExtArgs>
    invoices?: boolean | Tenant$invoicesArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    plan?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    plan?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tenant"]>

  export type TenantSelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    plan?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TenantOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "slug" | "plan" | "createdAt" | "updatedAt", ExtArgs["result"]["tenant"]>
  export type TenantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    users?: boolean | Tenant$usersArgs<ExtArgs>
    packages?: boolean | Tenant$packagesArgs<ExtArgs>
    shoots?: boolean | Tenant$shootsArgs<ExtArgs>
    shotLists?: boolean | Tenant$shotListsArgs<ExtArgs>
    galleries?: boolean | Tenant$galleriesArgs<ExtArgs>
    clients?: boolean | Tenant$clientsArgs<ExtArgs>
    invoices?: boolean | Tenant$invoicesArgs<ExtArgs>
    _count?: boolean | TenantCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TenantIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TenantIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TenantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Tenant"
    objects: {
      users: Prisma.$UserPayload<ExtArgs>[]
      packages: Prisma.$PackagePayload<ExtArgs>[]
      shoots: Prisma.$ShootPayload<ExtArgs>[]
      shotLists: Prisma.$ShotListPayload<ExtArgs>[]
      galleries: Prisma.$GalleryPayload<ExtArgs>[]
      clients: Prisma.$ClientPayload<ExtArgs>[]
      invoices: Prisma.$InvoicePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      plan: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tenant"]>
    composites: {}
  }

  type TenantGetPayload<S extends boolean | null | undefined | TenantDefaultArgs> = $Result.GetResult<Prisma.$TenantPayload, S>

  type TenantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TenantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TenantCountAggregateInputType | true
    }

  export interface TenantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Tenant'], meta: { name: 'Tenant' } }
    /**
     * Find zero or one Tenant that matches the filter.
     * @param {TenantFindUniqueArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TenantFindUniqueArgs>(args: SelectSubset<T, TenantFindUniqueArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tenant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TenantFindUniqueOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TenantFindUniqueOrThrowArgs>(args: SelectSubset<T, TenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TenantFindFirstArgs>(args?: SelectSubset<T, TenantFindFirstArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tenant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindFirstOrThrowArgs} args - Arguments to find a Tenant
     * @example
     * // Get one Tenant
     * const tenant = await prisma.tenant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TenantFindFirstOrThrowArgs>(args?: SelectSubset<T, TenantFindFirstOrThrowArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tenants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tenants
     * const tenants = await prisma.tenant.findMany()
     * 
     * // Get first 10 Tenants
     * const tenants = await prisma.tenant.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tenantWithIdOnly = await prisma.tenant.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TenantFindManyArgs>(args?: SelectSubset<T, TenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tenant.
     * @param {TenantCreateArgs} args - Arguments to create a Tenant.
     * @example
     * // Create one Tenant
     * const Tenant = await prisma.tenant.create({
     *   data: {
     *     // ... data to create a Tenant
     *   }
     * })
     * 
     */
    create<T extends TenantCreateArgs>(args: SelectSubset<T, TenantCreateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tenants.
     * @param {TenantCreateManyArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TenantCreateManyArgs>(args?: SelectSubset<T, TenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tenants and returns the data saved in the database.
     * @param {TenantCreateManyAndReturnArgs} args - Arguments to create many Tenants.
     * @example
     * // Create many Tenants
     * const tenant = await prisma.tenant.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TenantCreateManyAndReturnArgs>(args?: SelectSubset<T, TenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tenant.
     * @param {TenantDeleteArgs} args - Arguments to delete one Tenant.
     * @example
     * // Delete one Tenant
     * const Tenant = await prisma.tenant.delete({
     *   where: {
     *     // ... filter to delete one Tenant
     *   }
     * })
     * 
     */
    delete<T extends TenantDeleteArgs>(args: SelectSubset<T, TenantDeleteArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tenant.
     * @param {TenantUpdateArgs} args - Arguments to update one Tenant.
     * @example
     * // Update one Tenant
     * const tenant = await prisma.tenant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TenantUpdateArgs>(args: SelectSubset<T, TenantUpdateArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tenants.
     * @param {TenantDeleteManyArgs} args - Arguments to filter Tenants to delete.
     * @example
     * // Delete a few Tenants
     * const { count } = await prisma.tenant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TenantDeleteManyArgs>(args?: SelectSubset<T, TenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TenantUpdateManyArgs>(args: SelectSubset<T, TenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tenants and returns the data updated in the database.
     * @param {TenantUpdateManyAndReturnArgs} args - Arguments to update many Tenants.
     * @example
     * // Update many Tenants
     * const tenant = await prisma.tenant.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tenants and only return the `id`
     * const tenantWithIdOnly = await prisma.tenant.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TenantUpdateManyAndReturnArgs>(args: SelectSubset<T, TenantUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tenant.
     * @param {TenantUpsertArgs} args - Arguments to update or create a Tenant.
     * @example
     * // Update or create a Tenant
     * const tenant = await prisma.tenant.upsert({
     *   create: {
     *     // ... data to create a Tenant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tenant we want to update
     *   }
     * })
     */
    upsert<T extends TenantUpsertArgs>(args: SelectSubset<T, TenantUpsertArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tenants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantCountArgs} args - Arguments to filter Tenants to count.
     * @example
     * // Count the number of Tenants
     * const count = await prisma.tenant.count({
     *   where: {
     *     // ... the filter for the Tenants we want to count
     *   }
     * })
    **/
    count<T extends TenantCountArgs>(
      args?: Subset<T, TenantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TenantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TenantAggregateArgs>(args: Subset<T, TenantAggregateArgs>): Prisma.PrismaPromise<GetTenantAggregateType<T>>

    /**
     * Group by Tenant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TenantGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TenantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TenantGroupByArgs['orderBy'] }
        : { orderBy?: TenantGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Tenant model
   */
  readonly fields: TenantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Tenant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TenantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    users<T extends Tenant$usersArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$usersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    packages<T extends Tenant$packagesArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$packagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    shoots<T extends Tenant$shootsArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$shootsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShootPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    shotLists<T extends Tenant$shotListsArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$shotListsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShotListPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    galleries<T extends Tenant$galleriesArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$galleriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GalleryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    clients<T extends Tenant$clientsArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$clientsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    invoices<T extends Tenant$invoicesArgs<ExtArgs> = {}>(args?: Subset<T, Tenant$invoicesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Tenant model
   */
  interface TenantFieldRefs {
    readonly id: FieldRef<"Tenant", 'String'>
    readonly name: FieldRef<"Tenant", 'String'>
    readonly slug: FieldRef<"Tenant", 'String'>
    readonly plan: FieldRef<"Tenant", 'String'>
    readonly createdAt: FieldRef<"Tenant", 'DateTime'>
    readonly updatedAt: FieldRef<"Tenant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Tenant findUnique
   */
  export type TenantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findUniqueOrThrow
   */
  export type TenantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant findFirst
   */
  export type TenantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findFirstOrThrow
   */
  export type TenantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenant to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tenants.
     */
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant findMany
   */
  export type TenantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter, which Tenants to fetch.
     */
    where?: TenantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tenants to fetch.
     */
    orderBy?: TenantOrderByWithRelationInput | TenantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tenants.
     */
    cursor?: TenantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tenants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tenants.
     */
    skip?: number
    distinct?: TenantScalarFieldEnum | TenantScalarFieldEnum[]
  }

  /**
   * Tenant create
   */
  export type TenantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to create a Tenant.
     */
    data: XOR<TenantCreateInput, TenantUncheckedCreateInput>
  }

  /**
   * Tenant createMany
   */
  export type TenantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant createManyAndReturn
   */
  export type TenantCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to create many Tenants.
     */
    data: TenantCreateManyInput | TenantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Tenant update
   */
  export type TenantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The data needed to update a Tenant.
     */
    data: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
    /**
     * Choose, which Tenant to update.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant updateMany
   */
  export type TenantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
  }

  /**
   * Tenant updateManyAndReturn
   */
  export type TenantUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * The data used to update Tenants.
     */
    data: XOR<TenantUpdateManyMutationInput, TenantUncheckedUpdateManyInput>
    /**
     * Filter which Tenants to update
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to update.
     */
    limit?: number
  }

  /**
   * Tenant upsert
   */
  export type TenantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * The filter to search for the Tenant to update in case it exists.
     */
    where: TenantWhereUniqueInput
    /**
     * In case the Tenant found by the `where` argument doesn't exist, create a new Tenant with this data.
     */
    create: XOR<TenantCreateInput, TenantUncheckedCreateInput>
    /**
     * In case the Tenant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TenantUpdateInput, TenantUncheckedUpdateInput>
  }

  /**
   * Tenant delete
   */
  export type TenantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
    /**
     * Filter which Tenant to delete.
     */
    where: TenantWhereUniqueInput
  }

  /**
   * Tenant deleteMany
   */
  export type TenantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tenants to delete
     */
    where?: TenantWhereInput
    /**
     * Limit how many Tenants to delete.
     */
    limit?: number
  }

  /**
   * Tenant.users
   */
  export type Tenant$usersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    cursor?: UserWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * Tenant.packages
   */
  export type Tenant$packagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Package
     */
    omit?: PackageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    where?: PackageWhereInput
    orderBy?: PackageOrderByWithRelationInput | PackageOrderByWithRelationInput[]
    cursor?: PackageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PackageScalarFieldEnum | PackageScalarFieldEnum[]
  }

  /**
   * Tenant.shoots
   */
  export type Tenant$shootsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shoot
     */
    select?: ShootSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shoot
     */
    omit?: ShootOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShootInclude<ExtArgs> | null
    where?: ShootWhereInput
    orderBy?: ShootOrderByWithRelationInput | ShootOrderByWithRelationInput[]
    cursor?: ShootWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShootScalarFieldEnum | ShootScalarFieldEnum[]
  }

  /**
   * Tenant.shotLists
   */
  export type Tenant$shotListsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShotList
     */
    select?: ShotListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShotList
     */
    omit?: ShotListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShotListInclude<ExtArgs> | null
    where?: ShotListWhereInput
    orderBy?: ShotListOrderByWithRelationInput | ShotListOrderByWithRelationInput[]
    cursor?: ShotListWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShotListScalarFieldEnum | ShotListScalarFieldEnum[]
  }

  /**
   * Tenant.galleries
   */
  export type Tenant$galleriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Gallery
     */
    select?: GallerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Gallery
     */
    omit?: GalleryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryInclude<ExtArgs> | null
    where?: GalleryWhereInput
    orderBy?: GalleryOrderByWithRelationInput | GalleryOrderByWithRelationInput[]
    cursor?: GalleryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GalleryScalarFieldEnum | GalleryScalarFieldEnum[]
  }

  /**
   * Tenant.clients
   */
  export type Tenant$clientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    where?: ClientWhereInput
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[]
    cursor?: ClientWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClientScalarFieldEnum | ClientScalarFieldEnum[]
  }

  /**
   * Tenant.invoices
   */
  export type Tenant$invoicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    where?: InvoiceWhereInput
    orderBy?: InvoiceOrderByWithRelationInput | InvoiceOrderByWithRelationInput[]
    cursor?: InvoiceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InvoiceScalarFieldEnum | InvoiceScalarFieldEnum[]
  }

  /**
   * Tenant without action
   */
  export type TenantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tenant
     */
    select?: TenantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Tenant
     */
    omit?: TenantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TenantInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    passwordHash: string | null
    role: string | null
    tenantId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    name: string | null
    passwordHash: string | null
    role: string | null
    tenantId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    passwordHash: number
    role: number
    tenantId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    passwordHash?: true
    role?: true
    tenantId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    passwordHash?: true
    role?: true
    tenantId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    passwordHash?: true
    role?: true
    tenantId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    name: string | null
    passwordHash: string
    role: string
    tenantId: string
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    passwordHash?: boolean
    role?: boolean
    tenantId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    passwordHash?: boolean
    role?: boolean
    tenantId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    passwordHash?: boolean
    role?: boolean
    tenantId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    passwordHash?: boolean
    role?: boolean
    tenantId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "passwordHash" | "role" | "tenantId" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      name: string | null
      passwordHash: string
      role: string
      tenantId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly passwordHash: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'String'>
    readonly tenantId: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Client
   */

  export type AggregateClient = {
    _count: ClientCountAggregateOutputType | null
    _min: ClientMinAggregateOutputType | null
    _max: ClientMaxAggregateOutputType | null
  }

  export type ClientMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    email: string | null
    phone: string | null
    address: string | null
    type: string | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ClientMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    name: string | null
    email: string | null
    phone: string | null
    address: string | null
    type: string | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ClientCountAggregateOutputType = {
    id: number
    tenantId: number
    name: number
    email: number
    phone: number
    address: number
    type: number
    tags: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ClientMinAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    email?: true
    phone?: true
    address?: true
    type?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ClientMaxAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    email?: true
    phone?: true
    address?: true
    type?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ClientCountAggregateInputType = {
    id?: true
    tenantId?: true
    name?: true
    email?: true
    phone?: true
    address?: true
    type?: true
    tags?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ClientAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Client to aggregate.
     */
    where?: ClientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clients to fetch.
     */
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Clients
    **/
    _count?: true | ClientCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClientMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClientMaxAggregateInputType
  }

  export type GetClientAggregateType<T extends ClientAggregateArgs> = {
        [P in keyof T & keyof AggregateClient]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateClient[P]>
      : GetScalarType<T[P], AggregateClient[P]>
  }




  export type ClientGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClientWhereInput
    orderBy?: ClientOrderByWithAggregationInput | ClientOrderByWithAggregationInput[]
    by: ClientScalarFieldEnum[] | ClientScalarFieldEnum
    having?: ClientScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClientCountAggregateInputType | true
    _min?: ClientMinAggregateInputType
    _max?: ClientMaxAggregateInputType
  }

  export type ClientGroupByOutputType = {
    id: string
    tenantId: string
    name: string
    email: string
    phone: string | null
    address: string | null
    type: string
    tags: string[]
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: ClientCountAggregateOutputType | null
    _min: ClientMinAggregateOutputType | null
    _max: ClientMaxAggregateOutputType | null
  }

  type GetClientGroupByPayload<T extends ClientGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClientGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClientGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClientGroupByOutputType[P]>
            : GetScalarType<T[P], ClientGroupByOutputType[P]>
        }
      >
    >


  export type ClientSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    address?: boolean
    type?: boolean
    tags?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    packages?: boolean | Client$packagesArgs<ExtArgs>
    invoices?: boolean | Client$invoicesArgs<ExtArgs>
    _count?: boolean | ClientCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["client"]>

  export type ClientSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    address?: boolean
    type?: boolean
    tags?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["client"]>

  export type ClientSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    address?: boolean
    type?: boolean
    tags?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["client"]>

  export type ClientSelectScalar = {
    id?: boolean
    tenantId?: boolean
    name?: boolean
    email?: boolean
    phone?: boolean
    address?: boolean
    type?: boolean
    tags?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ClientOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "name" | "email" | "phone" | "address" | "type" | "tags" | "notes" | "createdAt" | "updatedAt", ExtArgs["result"]["client"]>
  export type ClientInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    packages?: boolean | Client$packagesArgs<ExtArgs>
    invoices?: boolean | Client$invoicesArgs<ExtArgs>
    _count?: boolean | ClientCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ClientIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }
  export type ClientIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
  }

  export type $ClientPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Client"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      packages: Prisma.$PackagePayload<ExtArgs>[]
      invoices: Prisma.$InvoicePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      name: string
      email: string
      phone: string | null
      address: string | null
      type: string
      tags: string[]
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["client"]>
    composites: {}
  }

  type ClientGetPayload<S extends boolean | null | undefined | ClientDefaultArgs> = $Result.GetResult<Prisma.$ClientPayload, S>

  type ClientCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ClientFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ClientCountAggregateInputType | true
    }

  export interface ClientDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Client'], meta: { name: 'Client' } }
    /**
     * Find zero or one Client that matches the filter.
     * @param {ClientFindUniqueArgs} args - Arguments to find a Client
     * @example
     * // Get one Client
     * const client = await prisma.client.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClientFindUniqueArgs>(args: SelectSubset<T, ClientFindUniqueArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Client that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ClientFindUniqueOrThrowArgs} args - Arguments to find a Client
     * @example
     * // Get one Client
     * const client = await prisma.client.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClientFindUniqueOrThrowArgs>(args: SelectSubset<T, ClientFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Client that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFindFirstArgs} args - Arguments to find a Client
     * @example
     * // Get one Client
     * const client = await prisma.client.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClientFindFirstArgs>(args?: SelectSubset<T, ClientFindFirstArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Client that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFindFirstOrThrowArgs} args - Arguments to find a Client
     * @example
     * // Get one Client
     * const client = await prisma.client.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClientFindFirstOrThrowArgs>(args?: SelectSubset<T, ClientFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Clients that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Clients
     * const clients = await prisma.client.findMany()
     * 
     * // Get first 10 Clients
     * const clients = await prisma.client.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const clientWithIdOnly = await prisma.client.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ClientFindManyArgs>(args?: SelectSubset<T, ClientFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Client.
     * @param {ClientCreateArgs} args - Arguments to create a Client.
     * @example
     * // Create one Client
     * const Client = await prisma.client.create({
     *   data: {
     *     // ... data to create a Client
     *   }
     * })
     * 
     */
    create<T extends ClientCreateArgs>(args: SelectSubset<T, ClientCreateArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Clients.
     * @param {ClientCreateManyArgs} args - Arguments to create many Clients.
     * @example
     * // Create many Clients
     * const client = await prisma.client.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClientCreateManyArgs>(args?: SelectSubset<T, ClientCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Clients and returns the data saved in the database.
     * @param {ClientCreateManyAndReturnArgs} args - Arguments to create many Clients.
     * @example
     * // Create many Clients
     * const client = await prisma.client.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Clients and only return the `id`
     * const clientWithIdOnly = await prisma.client.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClientCreateManyAndReturnArgs>(args?: SelectSubset<T, ClientCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Client.
     * @param {ClientDeleteArgs} args - Arguments to delete one Client.
     * @example
     * // Delete one Client
     * const Client = await prisma.client.delete({
     *   where: {
     *     // ... filter to delete one Client
     *   }
     * })
     * 
     */
    delete<T extends ClientDeleteArgs>(args: SelectSubset<T, ClientDeleteArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Client.
     * @param {ClientUpdateArgs} args - Arguments to update one Client.
     * @example
     * // Update one Client
     * const client = await prisma.client.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClientUpdateArgs>(args: SelectSubset<T, ClientUpdateArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Clients.
     * @param {ClientDeleteManyArgs} args - Arguments to filter Clients to delete.
     * @example
     * // Delete a few Clients
     * const { count } = await prisma.client.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClientDeleteManyArgs>(args?: SelectSubset<T, ClientDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Clients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Clients
     * const client = await prisma.client.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClientUpdateManyArgs>(args: SelectSubset<T, ClientUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Clients and returns the data updated in the database.
     * @param {ClientUpdateManyAndReturnArgs} args - Arguments to update many Clients.
     * @example
     * // Update many Clients
     * const client = await prisma.client.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Clients and only return the `id`
     * const clientWithIdOnly = await prisma.client.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ClientUpdateManyAndReturnArgs>(args: SelectSubset<T, ClientUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Client.
     * @param {ClientUpsertArgs} args - Arguments to update or create a Client.
     * @example
     * // Update or create a Client
     * const client = await prisma.client.upsert({
     *   create: {
     *     // ... data to create a Client
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Client we want to update
     *   }
     * })
     */
    upsert<T extends ClientUpsertArgs>(args: SelectSubset<T, ClientUpsertArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Clients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientCountArgs} args - Arguments to filter Clients to count.
     * @example
     * // Count the number of Clients
     * const count = await prisma.client.count({
     *   where: {
     *     // ... the filter for the Clients we want to count
     *   }
     * })
    **/
    count<T extends ClientCountArgs>(
      args?: Subset<T, ClientCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClientCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Client.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClientAggregateArgs>(args: Subset<T, ClientAggregateArgs>): Prisma.PrismaPromise<GetClientAggregateType<T>>

    /**
     * Group by Client.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClientGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClientGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClientGroupByArgs['orderBy'] }
        : { orderBy?: ClientGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClientGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClientGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Client model
   */
  readonly fields: ClientFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Client.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClientClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    packages<T extends Client$packagesArgs<ExtArgs> = {}>(args?: Subset<T, Client$packagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    invoices<T extends Client$invoicesArgs<ExtArgs> = {}>(args?: Subset<T, Client$invoicesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Client model
   */
  interface ClientFieldRefs {
    readonly id: FieldRef<"Client", 'String'>
    readonly tenantId: FieldRef<"Client", 'String'>
    readonly name: FieldRef<"Client", 'String'>
    readonly email: FieldRef<"Client", 'String'>
    readonly phone: FieldRef<"Client", 'String'>
    readonly address: FieldRef<"Client", 'String'>
    readonly type: FieldRef<"Client", 'String'>
    readonly tags: FieldRef<"Client", 'String[]'>
    readonly notes: FieldRef<"Client", 'String'>
    readonly createdAt: FieldRef<"Client", 'DateTime'>
    readonly updatedAt: FieldRef<"Client", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Client findUnique
   */
  export type ClientFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter, which Client to fetch.
     */
    where: ClientWhereUniqueInput
  }

  /**
   * Client findUniqueOrThrow
   */
  export type ClientFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter, which Client to fetch.
     */
    where: ClientWhereUniqueInput
  }

  /**
   * Client findFirst
   */
  export type ClientFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter, which Client to fetch.
     */
    where?: ClientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clients to fetch.
     */
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Clients.
     */
    cursor?: ClientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Clients.
     */
    distinct?: ClientScalarFieldEnum | ClientScalarFieldEnum[]
  }

  /**
   * Client findFirstOrThrow
   */
  export type ClientFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter, which Client to fetch.
     */
    where?: ClientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clients to fetch.
     */
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Clients.
     */
    cursor?: ClientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Clients.
     */
    distinct?: ClientScalarFieldEnum | ClientScalarFieldEnum[]
  }

  /**
   * Client findMany
   */
  export type ClientFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter, which Clients to fetch.
     */
    where?: ClientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Clients to fetch.
     */
    orderBy?: ClientOrderByWithRelationInput | ClientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Clients.
     */
    cursor?: ClientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Clients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Clients.
     */
    skip?: number
    distinct?: ClientScalarFieldEnum | ClientScalarFieldEnum[]
  }

  /**
   * Client create
   */
  export type ClientCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * The data needed to create a Client.
     */
    data: XOR<ClientCreateInput, ClientUncheckedCreateInput>
  }

  /**
   * Client createMany
   */
  export type ClientCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Clients.
     */
    data: ClientCreateManyInput | ClientCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Client createManyAndReturn
   */
  export type ClientCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * The data used to create many Clients.
     */
    data: ClientCreateManyInput | ClientCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Client update
   */
  export type ClientUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * The data needed to update a Client.
     */
    data: XOR<ClientUpdateInput, ClientUncheckedUpdateInput>
    /**
     * Choose, which Client to update.
     */
    where: ClientWhereUniqueInput
  }

  /**
   * Client updateMany
   */
  export type ClientUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Clients.
     */
    data: XOR<ClientUpdateManyMutationInput, ClientUncheckedUpdateManyInput>
    /**
     * Filter which Clients to update
     */
    where?: ClientWhereInput
    /**
     * Limit how many Clients to update.
     */
    limit?: number
  }

  /**
   * Client updateManyAndReturn
   */
  export type ClientUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * The data used to update Clients.
     */
    data: XOR<ClientUpdateManyMutationInput, ClientUncheckedUpdateManyInput>
    /**
     * Filter which Clients to update
     */
    where?: ClientWhereInput
    /**
     * Limit how many Clients to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Client upsert
   */
  export type ClientUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * The filter to search for the Client to update in case it exists.
     */
    where: ClientWhereUniqueInput
    /**
     * In case the Client found by the `where` argument doesn't exist, create a new Client with this data.
     */
    create: XOR<ClientCreateInput, ClientUncheckedCreateInput>
    /**
     * In case the Client was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClientUpdateInput, ClientUncheckedUpdateInput>
  }

  /**
   * Client delete
   */
  export type ClientDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
    /**
     * Filter which Client to delete.
     */
    where: ClientWhereUniqueInput
  }

  /**
   * Client deleteMany
   */
  export type ClientDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Clients to delete
     */
    where?: ClientWhereInput
    /**
     * Limit how many Clients to delete.
     */
    limit?: number
  }

  /**
   * Client.packages
   */
  export type Client$packagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Package
     */
    omit?: PackageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    where?: PackageWhereInput
    orderBy?: PackageOrderByWithRelationInput | PackageOrderByWithRelationInput[]
    cursor?: PackageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PackageScalarFieldEnum | PackageScalarFieldEnum[]
  }

  /**
   * Client.invoices
   */
  export type Client$invoicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    where?: InvoiceWhereInput
    orderBy?: InvoiceOrderByWithRelationInput | InvoiceOrderByWithRelationInput[]
    cursor?: InvoiceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InvoiceScalarFieldEnum | InvoiceScalarFieldEnum[]
  }

  /**
   * Client without action
   */
  export type ClientDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Client
     */
    select?: ClientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Client
     */
    omit?: ClientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClientInclude<ExtArgs> | null
  }


  /**
   * Model Package
   */

  export type AggregatePackage = {
    _count: PackageCountAggregateOutputType | null
    _avg: PackageAvgAggregateOutputType | null
    _sum: PackageSumAggregateOutputType | null
    _min: PackageMinAggregateOutputType | null
    _max: PackageMaxAggregateOutputType | null
  }

  export type PackageAvgAggregateOutputType = {
    shotCount: number | null
    deliveryDays: number | null
    editingHours: number | null
    basePrice: number | null
    travelCosts: number | null
    totalPrice: number | null
  }

  export type PackageSumAggregateOutputType = {
    shotCount: number | null
    deliveryDays: number | null
    editingHours: number | null
    basePrice: number | null
    travelCosts: number | null
    totalPrice: number | null
  }

  export type PackageMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    clientId: string | null
    title: string | null
    status: $Enums.PackageStatus | null
    eventType: string | null
    eventDate: Date | null
    shotCount: number | null
    deliveryDays: number | null
    galleryUrl: string | null
    editingHours: number | null
    secondShooter: boolean | null
    rawFilesIncluded: boolean | null
    basePrice: number | null
    travelCosts: number | null
    totalPrice: number | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PackageMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    clientId: string | null
    title: string | null
    status: $Enums.PackageStatus | null
    eventType: string | null
    eventDate: Date | null
    shotCount: number | null
    deliveryDays: number | null
    galleryUrl: string | null
    editingHours: number | null
    secondShooter: boolean | null
    rawFilesIncluded: boolean | null
    basePrice: number | null
    travelCosts: number | null
    totalPrice: number | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PackageCountAggregateOutputType = {
    id: number
    tenantId: number
    clientId: number
    title: number
    status: number
    eventType: number
    eventDate: number
    shotCount: number
    deliveryDays: number
    galleryUrl: number
    editingHours: number
    styleTags: number
    equipment: number
    secondShooter: number
    rawFilesIncluded: number
    timeline: number
    basePrice: number
    travelCosts: number
    totalPrice: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PackageAvgAggregateInputType = {
    shotCount?: true
    deliveryDays?: true
    editingHours?: true
    basePrice?: true
    travelCosts?: true
    totalPrice?: true
  }

  export type PackageSumAggregateInputType = {
    shotCount?: true
    deliveryDays?: true
    editingHours?: true
    basePrice?: true
    travelCosts?: true
    totalPrice?: true
  }

  export type PackageMinAggregateInputType = {
    id?: true
    tenantId?: true
    clientId?: true
    title?: true
    status?: true
    eventType?: true
    eventDate?: true
    shotCount?: true
    deliveryDays?: true
    galleryUrl?: true
    editingHours?: true
    secondShooter?: true
    rawFilesIncluded?: true
    basePrice?: true
    travelCosts?: true
    totalPrice?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PackageMaxAggregateInputType = {
    id?: true
    tenantId?: true
    clientId?: true
    title?: true
    status?: true
    eventType?: true
    eventDate?: true
    shotCount?: true
    deliveryDays?: true
    galleryUrl?: true
    editingHours?: true
    secondShooter?: true
    rawFilesIncluded?: true
    basePrice?: true
    travelCosts?: true
    totalPrice?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PackageCountAggregateInputType = {
    id?: true
    tenantId?: true
    clientId?: true
    title?: true
    status?: true
    eventType?: true
    eventDate?: true
    shotCount?: true
    deliveryDays?: true
    galleryUrl?: true
    editingHours?: true
    styleTags?: true
    equipment?: true
    secondShooter?: true
    rawFilesIncluded?: true
    timeline?: true
    basePrice?: true
    travelCosts?: true
    totalPrice?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PackageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Package to aggregate.
     */
    where?: PackageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Packages to fetch.
     */
    orderBy?: PackageOrderByWithRelationInput | PackageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PackageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Packages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Packages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Packages
    **/
    _count?: true | PackageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PackageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PackageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PackageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PackageMaxAggregateInputType
  }

  export type GetPackageAggregateType<T extends PackageAggregateArgs> = {
        [P in keyof T & keyof AggregatePackage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePackage[P]>
      : GetScalarType<T[P], AggregatePackage[P]>
  }




  export type PackageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PackageWhereInput
    orderBy?: PackageOrderByWithAggregationInput | PackageOrderByWithAggregationInput[]
    by: PackageScalarFieldEnum[] | PackageScalarFieldEnum
    having?: PackageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PackageCountAggregateInputType | true
    _avg?: PackageAvgAggregateInputType
    _sum?: PackageSumAggregateInputType
    _min?: PackageMinAggregateInputType
    _max?: PackageMaxAggregateInputType
  }

  export type PackageGroupByOutputType = {
    id: string
    tenantId: string
    clientId: string
    title: string
    status: $Enums.PackageStatus
    eventType: string | null
    eventDate: Date | null
    shotCount: number | null
    deliveryDays: number | null
    galleryUrl: string | null
    editingHours: number | null
    styleTags: string[]
    equipment: string[]
    secondShooter: boolean
    rawFilesIncluded: boolean
    timeline: JsonValue | null
    basePrice: number | null
    travelCosts: number | null
    totalPrice: number | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: PackageCountAggregateOutputType | null
    _avg: PackageAvgAggregateOutputType | null
    _sum: PackageSumAggregateOutputType | null
    _min: PackageMinAggregateOutputType | null
    _max: PackageMaxAggregateOutputType | null
  }

  type GetPackageGroupByPayload<T extends PackageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PackageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PackageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PackageGroupByOutputType[P]>
            : GetScalarType<T[P], PackageGroupByOutputType[P]>
        }
      >
    >


  export type PackageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    clientId?: boolean
    title?: boolean
    status?: boolean
    eventType?: boolean
    eventDate?: boolean
    shotCount?: boolean
    deliveryDays?: boolean
    galleryUrl?: boolean
    editingHours?: boolean
    styleTags?: boolean
    equipment?: boolean
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: boolean
    basePrice?: boolean
    travelCosts?: boolean
    totalPrice?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
    shoots?: boolean | Package$shootsArgs<ExtArgs>
    addons?: boolean | Package$addonsArgs<ExtArgs>
    invoices?: boolean | Package$invoicesArgs<ExtArgs>
    shotLists?: boolean | Package$shotListsArgs<ExtArgs>
    _count?: boolean | PackageCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["package"]>

  export type PackageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    clientId?: boolean
    title?: boolean
    status?: boolean
    eventType?: boolean
    eventDate?: boolean
    shotCount?: boolean
    deliveryDays?: boolean
    galleryUrl?: boolean
    editingHours?: boolean
    styleTags?: boolean
    equipment?: boolean
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: boolean
    basePrice?: boolean
    travelCosts?: boolean
    totalPrice?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["package"]>

  export type PackageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    clientId?: boolean
    title?: boolean
    status?: boolean
    eventType?: boolean
    eventDate?: boolean
    shotCount?: boolean
    deliveryDays?: boolean
    galleryUrl?: boolean
    editingHours?: boolean
    styleTags?: boolean
    equipment?: boolean
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: boolean
    basePrice?: boolean
    travelCosts?: boolean
    totalPrice?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["package"]>

  export type PackageSelectScalar = {
    id?: boolean
    tenantId?: boolean
    clientId?: boolean
    title?: boolean
    status?: boolean
    eventType?: boolean
    eventDate?: boolean
    shotCount?: boolean
    deliveryDays?: boolean
    galleryUrl?: boolean
    editingHours?: boolean
    styleTags?: boolean
    equipment?: boolean
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: boolean
    basePrice?: boolean
    travelCosts?: boolean
    totalPrice?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PackageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "clientId" | "title" | "status" | "eventType" | "eventDate" | "shotCount" | "deliveryDays" | "galleryUrl" | "editingHours" | "styleTags" | "equipment" | "secondShooter" | "rawFilesIncluded" | "timeline" | "basePrice" | "travelCosts" | "totalPrice" | "notes" | "createdAt" | "updatedAt", ExtArgs["result"]["package"]>
  export type PackageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
    shoots?: boolean | Package$shootsArgs<ExtArgs>
    addons?: boolean | Package$addonsArgs<ExtArgs>
    invoices?: boolean | Package$invoicesArgs<ExtArgs>
    shotLists?: boolean | Package$shotListsArgs<ExtArgs>
    _count?: boolean | PackageCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PackageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }
  export type PackageIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
  }

  export type $PackagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Package"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      client: Prisma.$ClientPayload<ExtArgs>
      shoots: Prisma.$ShootPayload<ExtArgs>[]
      addons: Prisma.$PackageAddonPayload<ExtArgs>[]
      invoices: Prisma.$InvoicePayload<ExtArgs>[]
      shotLists: Prisma.$ShotListPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      clientId: string
      title: string
      status: $Enums.PackageStatus
      eventType: string | null
      eventDate: Date | null
      shotCount: number | null
      deliveryDays: number | null
      galleryUrl: string | null
      editingHours: number | null
      styleTags: string[]
      equipment: string[]
      secondShooter: boolean
      rawFilesIncluded: boolean
      timeline: Prisma.JsonValue | null
      basePrice: number | null
      travelCosts: number | null
      totalPrice: number | null
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["package"]>
    composites: {}
  }

  type PackageGetPayload<S extends boolean | null | undefined | PackageDefaultArgs> = $Result.GetResult<Prisma.$PackagePayload, S>

  type PackageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PackageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PackageCountAggregateInputType | true
    }

  export interface PackageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Package'], meta: { name: 'Package' } }
    /**
     * Find zero or one Package that matches the filter.
     * @param {PackageFindUniqueArgs} args - Arguments to find a Package
     * @example
     * // Get one Package
     * const package = await prisma.package.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PackageFindUniqueArgs>(args: SelectSubset<T, PackageFindUniqueArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Package that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PackageFindUniqueOrThrowArgs} args - Arguments to find a Package
     * @example
     * // Get one Package
     * const package = await prisma.package.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PackageFindUniqueOrThrowArgs>(args: SelectSubset<T, PackageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Package that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageFindFirstArgs} args - Arguments to find a Package
     * @example
     * // Get one Package
     * const package = await prisma.package.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PackageFindFirstArgs>(args?: SelectSubset<T, PackageFindFirstArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Package that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageFindFirstOrThrowArgs} args - Arguments to find a Package
     * @example
     * // Get one Package
     * const package = await prisma.package.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PackageFindFirstOrThrowArgs>(args?: SelectSubset<T, PackageFindFirstOrThrowArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Packages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Packages
     * const packages = await prisma.package.findMany()
     * 
     * // Get first 10 Packages
     * const packages = await prisma.package.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const packageWithIdOnly = await prisma.package.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PackageFindManyArgs>(args?: SelectSubset<T, PackageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Package.
     * @param {PackageCreateArgs} args - Arguments to create a Package.
     * @example
     * // Create one Package
     * const Package = await prisma.package.create({
     *   data: {
     *     // ... data to create a Package
     *   }
     * })
     * 
     */
    create<T extends PackageCreateArgs>(args: SelectSubset<T, PackageCreateArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Packages.
     * @param {PackageCreateManyArgs} args - Arguments to create many Packages.
     * @example
     * // Create many Packages
     * const package = await prisma.package.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PackageCreateManyArgs>(args?: SelectSubset<T, PackageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Packages and returns the data saved in the database.
     * @param {PackageCreateManyAndReturnArgs} args - Arguments to create many Packages.
     * @example
     * // Create many Packages
     * const package = await prisma.package.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Packages and only return the `id`
     * const packageWithIdOnly = await prisma.package.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PackageCreateManyAndReturnArgs>(args?: SelectSubset<T, PackageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Package.
     * @param {PackageDeleteArgs} args - Arguments to delete one Package.
     * @example
     * // Delete one Package
     * const Package = await prisma.package.delete({
     *   where: {
     *     // ... filter to delete one Package
     *   }
     * })
     * 
     */
    delete<T extends PackageDeleteArgs>(args: SelectSubset<T, PackageDeleteArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Package.
     * @param {PackageUpdateArgs} args - Arguments to update one Package.
     * @example
     * // Update one Package
     * const package = await prisma.package.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PackageUpdateArgs>(args: SelectSubset<T, PackageUpdateArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Packages.
     * @param {PackageDeleteManyArgs} args - Arguments to filter Packages to delete.
     * @example
     * // Delete a few Packages
     * const { count } = await prisma.package.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PackageDeleteManyArgs>(args?: SelectSubset<T, PackageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Packages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Packages
     * const package = await prisma.package.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PackageUpdateManyArgs>(args: SelectSubset<T, PackageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Packages and returns the data updated in the database.
     * @param {PackageUpdateManyAndReturnArgs} args - Arguments to update many Packages.
     * @example
     * // Update many Packages
     * const package = await prisma.package.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Packages and only return the `id`
     * const packageWithIdOnly = await prisma.package.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PackageUpdateManyAndReturnArgs>(args: SelectSubset<T, PackageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Package.
     * @param {PackageUpsertArgs} args - Arguments to update or create a Package.
     * @example
     * // Update or create a Package
     * const package = await prisma.package.upsert({
     *   create: {
     *     // ... data to create a Package
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Package we want to update
     *   }
     * })
     */
    upsert<T extends PackageUpsertArgs>(args: SelectSubset<T, PackageUpsertArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Packages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageCountArgs} args - Arguments to filter Packages to count.
     * @example
     * // Count the number of Packages
     * const count = await prisma.package.count({
     *   where: {
     *     // ... the filter for the Packages we want to count
     *   }
     * })
    **/
    count<T extends PackageCountArgs>(
      args?: Subset<T, PackageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PackageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Package.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PackageAggregateArgs>(args: Subset<T, PackageAggregateArgs>): Prisma.PrismaPromise<GetPackageAggregateType<T>>

    /**
     * Group by Package.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PackageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PackageGroupByArgs['orderBy'] }
        : { orderBy?: PackageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PackageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPackageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Package model
   */
  readonly fields: PackageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Package.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PackageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    client<T extends ClientDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClientDefaultArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    shoots<T extends Package$shootsArgs<ExtArgs> = {}>(args?: Subset<T, Package$shootsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShootPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    addons<T extends Package$addonsArgs<ExtArgs> = {}>(args?: Subset<T, Package$addonsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackageAddonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    invoices<T extends Package$invoicesArgs<ExtArgs> = {}>(args?: Subset<T, Package$invoicesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    shotLists<T extends Package$shotListsArgs<ExtArgs> = {}>(args?: Subset<T, Package$shotListsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShotListPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Package model
   */
  interface PackageFieldRefs {
    readonly id: FieldRef<"Package", 'String'>
    readonly tenantId: FieldRef<"Package", 'String'>
    readonly clientId: FieldRef<"Package", 'String'>
    readonly title: FieldRef<"Package", 'String'>
    readonly status: FieldRef<"Package", 'PackageStatus'>
    readonly eventType: FieldRef<"Package", 'String'>
    readonly eventDate: FieldRef<"Package", 'DateTime'>
    readonly shotCount: FieldRef<"Package", 'Int'>
    readonly deliveryDays: FieldRef<"Package", 'Int'>
    readonly galleryUrl: FieldRef<"Package", 'String'>
    readonly editingHours: FieldRef<"Package", 'Float'>
    readonly styleTags: FieldRef<"Package", 'String[]'>
    readonly equipment: FieldRef<"Package", 'String[]'>
    readonly secondShooter: FieldRef<"Package", 'Boolean'>
    readonly rawFilesIncluded: FieldRef<"Package", 'Boolean'>
    readonly timeline: FieldRef<"Package", 'Json'>
    readonly basePrice: FieldRef<"Package", 'Int'>
    readonly travelCosts: FieldRef<"Package", 'Int'>
    readonly totalPrice: FieldRef<"Package", 'Int'>
    readonly notes: FieldRef<"Package", 'String'>
    readonly createdAt: FieldRef<"Package", 'DateTime'>
    readonly updatedAt: FieldRef<"Package", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Package findUnique
   */
  export type PackageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Package
     */
    omit?: PackageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * Filter, which Package to fetch.
     */
    where: PackageWhereUniqueInput
  }

  /**
   * Package findUniqueOrThrow
   */
  export type PackageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Package
     */
    omit?: PackageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * Filter, which Package to fetch.
     */
    where: PackageWhereUniqueInput
  }

  /**
   * Package findFirst
   */
  export type PackageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Package
     */
    omit?: PackageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * Filter, which Package to fetch.
     */
    where?: PackageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Packages to fetch.
     */
    orderBy?: PackageOrderByWithRelationInput | PackageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Packages.
     */
    cursor?: PackageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Packages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Packages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Packages.
     */
    distinct?: PackageScalarFieldEnum | PackageScalarFieldEnum[]
  }

  /**
   * Package findFirstOrThrow
   */
  export type PackageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Package
     */
    omit?: PackageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * Filter, which Package to fetch.
     */
    where?: PackageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Packages to fetch.
     */
    orderBy?: PackageOrderByWithRelationInput | PackageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Packages.
     */
    cursor?: PackageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Packages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Packages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Packages.
     */
    distinct?: PackageScalarFieldEnum | PackageScalarFieldEnum[]
  }

  /**
   * Package findMany
   */
  export type PackageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Package
     */
    omit?: PackageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * Filter, which Packages to fetch.
     */
    where?: PackageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Packages to fetch.
     */
    orderBy?: PackageOrderByWithRelationInput | PackageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Packages.
     */
    cursor?: PackageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Packages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Packages.
     */
    skip?: number
    distinct?: PackageScalarFieldEnum | PackageScalarFieldEnum[]
  }

  /**
   * Package create
   */
  export type PackageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Package
     */
    omit?: PackageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * The data needed to create a Package.
     */
    data: XOR<PackageCreateInput, PackageUncheckedCreateInput>
  }

  /**
   * Package createMany
   */
  export type PackageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Packages.
     */
    data: PackageCreateManyInput | PackageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Package createManyAndReturn
   */
  export type PackageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Package
     */
    omit?: PackageOmit<ExtArgs> | null
    /**
     * The data used to create many Packages.
     */
    data: PackageCreateManyInput | PackageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Package update
   */
  export type PackageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Package
     */
    omit?: PackageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * The data needed to update a Package.
     */
    data: XOR<PackageUpdateInput, PackageUncheckedUpdateInput>
    /**
     * Choose, which Package to update.
     */
    where: PackageWhereUniqueInput
  }

  /**
   * Package updateMany
   */
  export type PackageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Packages.
     */
    data: XOR<PackageUpdateManyMutationInput, PackageUncheckedUpdateManyInput>
    /**
     * Filter which Packages to update
     */
    where?: PackageWhereInput
    /**
     * Limit how many Packages to update.
     */
    limit?: number
  }

  /**
   * Package updateManyAndReturn
   */
  export type PackageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Package
     */
    omit?: PackageOmit<ExtArgs> | null
    /**
     * The data used to update Packages.
     */
    data: XOR<PackageUpdateManyMutationInput, PackageUncheckedUpdateManyInput>
    /**
     * Filter which Packages to update
     */
    where?: PackageWhereInput
    /**
     * Limit how many Packages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Package upsert
   */
  export type PackageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Package
     */
    omit?: PackageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * The filter to search for the Package to update in case it exists.
     */
    where: PackageWhereUniqueInput
    /**
     * In case the Package found by the `where` argument doesn't exist, create a new Package with this data.
     */
    create: XOR<PackageCreateInput, PackageUncheckedCreateInput>
    /**
     * In case the Package was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PackageUpdateInput, PackageUncheckedUpdateInput>
  }

  /**
   * Package delete
   */
  export type PackageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Package
     */
    omit?: PackageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    /**
     * Filter which Package to delete.
     */
    where: PackageWhereUniqueInput
  }

  /**
   * Package deleteMany
   */
  export type PackageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Packages to delete
     */
    where?: PackageWhereInput
    /**
     * Limit how many Packages to delete.
     */
    limit?: number
  }

  /**
   * Package.shoots
   */
  export type Package$shootsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shoot
     */
    select?: ShootSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shoot
     */
    omit?: ShootOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShootInclude<ExtArgs> | null
    where?: ShootWhereInput
    orderBy?: ShootOrderByWithRelationInput | ShootOrderByWithRelationInput[]
    cursor?: ShootWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShootScalarFieldEnum | ShootScalarFieldEnum[]
  }

  /**
   * Package.addons
   */
  export type Package$addonsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageAddon
     */
    select?: PackageAddonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PackageAddon
     */
    omit?: PackageAddonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageAddonInclude<ExtArgs> | null
    where?: PackageAddonWhereInput
    orderBy?: PackageAddonOrderByWithRelationInput | PackageAddonOrderByWithRelationInput[]
    cursor?: PackageAddonWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PackageAddonScalarFieldEnum | PackageAddonScalarFieldEnum[]
  }

  /**
   * Package.invoices
   */
  export type Package$invoicesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    where?: InvoiceWhereInput
    orderBy?: InvoiceOrderByWithRelationInput | InvoiceOrderByWithRelationInput[]
    cursor?: InvoiceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InvoiceScalarFieldEnum | InvoiceScalarFieldEnum[]
  }

  /**
   * Package.shotLists
   */
  export type Package$shotListsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShotList
     */
    select?: ShotListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShotList
     */
    omit?: ShotListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShotListInclude<ExtArgs> | null
    where?: ShotListWhereInput
    orderBy?: ShotListOrderByWithRelationInput | ShotListOrderByWithRelationInput[]
    cursor?: ShotListWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ShotListScalarFieldEnum | ShotListScalarFieldEnum[]
  }

  /**
   * Package without action
   */
  export type PackageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Package
     */
    omit?: PackageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
  }


  /**
   * Model PackageAddon
   */

  export type AggregatePackageAddon = {
    _count: PackageAddonCountAggregateOutputType | null
    _avg: PackageAddonAvgAggregateOutputType | null
    _sum: PackageAddonSumAggregateOutputType | null
    _min: PackageAddonMinAggregateOutputType | null
    _max: PackageAddonMaxAggregateOutputType | null
  }

  export type PackageAddonAvgAggregateOutputType = {
    price: number | null
    quantity: number | null
  }

  export type PackageAddonSumAggregateOutputType = {
    price: number | null
    quantity: number | null
  }

  export type PackageAddonMinAggregateOutputType = {
    id: string | null
    packageId: string | null
    name: string | null
    description: string | null
    price: number | null
    quantity: number | null
    createdAt: Date | null
  }

  export type PackageAddonMaxAggregateOutputType = {
    id: string | null
    packageId: string | null
    name: string | null
    description: string | null
    price: number | null
    quantity: number | null
    createdAt: Date | null
  }

  export type PackageAddonCountAggregateOutputType = {
    id: number
    packageId: number
    name: number
    description: number
    price: number
    quantity: number
    createdAt: number
    _all: number
  }


  export type PackageAddonAvgAggregateInputType = {
    price?: true
    quantity?: true
  }

  export type PackageAddonSumAggregateInputType = {
    price?: true
    quantity?: true
  }

  export type PackageAddonMinAggregateInputType = {
    id?: true
    packageId?: true
    name?: true
    description?: true
    price?: true
    quantity?: true
    createdAt?: true
  }

  export type PackageAddonMaxAggregateInputType = {
    id?: true
    packageId?: true
    name?: true
    description?: true
    price?: true
    quantity?: true
    createdAt?: true
  }

  export type PackageAddonCountAggregateInputType = {
    id?: true
    packageId?: true
    name?: true
    description?: true
    price?: true
    quantity?: true
    createdAt?: true
    _all?: true
  }

  export type PackageAddonAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PackageAddon to aggregate.
     */
    where?: PackageAddonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackageAddons to fetch.
     */
    orderBy?: PackageAddonOrderByWithRelationInput | PackageAddonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PackageAddonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackageAddons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackageAddons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PackageAddons
    **/
    _count?: true | PackageAddonCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PackageAddonAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PackageAddonSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PackageAddonMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PackageAddonMaxAggregateInputType
  }

  export type GetPackageAddonAggregateType<T extends PackageAddonAggregateArgs> = {
        [P in keyof T & keyof AggregatePackageAddon]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePackageAddon[P]>
      : GetScalarType<T[P], AggregatePackageAddon[P]>
  }




  export type PackageAddonGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PackageAddonWhereInput
    orderBy?: PackageAddonOrderByWithAggregationInput | PackageAddonOrderByWithAggregationInput[]
    by: PackageAddonScalarFieldEnum[] | PackageAddonScalarFieldEnum
    having?: PackageAddonScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PackageAddonCountAggregateInputType | true
    _avg?: PackageAddonAvgAggregateInputType
    _sum?: PackageAddonSumAggregateInputType
    _min?: PackageAddonMinAggregateInputType
    _max?: PackageAddonMaxAggregateInputType
  }

  export type PackageAddonGroupByOutputType = {
    id: string
    packageId: string
    name: string
    description: string | null
    price: number
    quantity: number
    createdAt: Date
    _count: PackageAddonCountAggregateOutputType | null
    _avg: PackageAddonAvgAggregateOutputType | null
    _sum: PackageAddonSumAggregateOutputType | null
    _min: PackageAddonMinAggregateOutputType | null
    _max: PackageAddonMaxAggregateOutputType | null
  }

  type GetPackageAddonGroupByPayload<T extends PackageAddonGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PackageAddonGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PackageAddonGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PackageAddonGroupByOutputType[P]>
            : GetScalarType<T[P], PackageAddonGroupByOutputType[P]>
        }
      >
    >


  export type PackageAddonSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    packageId?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    quantity?: boolean
    createdAt?: boolean
    package?: boolean | PackageDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["packageAddon"]>

  export type PackageAddonSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    packageId?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    quantity?: boolean
    createdAt?: boolean
    package?: boolean | PackageDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["packageAddon"]>

  export type PackageAddonSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    packageId?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    quantity?: boolean
    createdAt?: boolean
    package?: boolean | PackageDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["packageAddon"]>

  export type PackageAddonSelectScalar = {
    id?: boolean
    packageId?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    quantity?: boolean
    createdAt?: boolean
  }

  export type PackageAddonOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "packageId" | "name" | "description" | "price" | "quantity" | "createdAt", ExtArgs["result"]["packageAddon"]>
  export type PackageAddonInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    package?: boolean | PackageDefaultArgs<ExtArgs>
  }
  export type PackageAddonIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    package?: boolean | PackageDefaultArgs<ExtArgs>
  }
  export type PackageAddonIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    package?: boolean | PackageDefaultArgs<ExtArgs>
  }

  export type $PackageAddonPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PackageAddon"
    objects: {
      package: Prisma.$PackagePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      packageId: string
      name: string
      description: string | null
      price: number
      quantity: number
      createdAt: Date
    }, ExtArgs["result"]["packageAddon"]>
    composites: {}
  }

  type PackageAddonGetPayload<S extends boolean | null | undefined | PackageAddonDefaultArgs> = $Result.GetResult<Prisma.$PackageAddonPayload, S>

  type PackageAddonCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PackageAddonFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PackageAddonCountAggregateInputType | true
    }

  export interface PackageAddonDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PackageAddon'], meta: { name: 'PackageAddon' } }
    /**
     * Find zero or one PackageAddon that matches the filter.
     * @param {PackageAddonFindUniqueArgs} args - Arguments to find a PackageAddon
     * @example
     * // Get one PackageAddon
     * const packageAddon = await prisma.packageAddon.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PackageAddonFindUniqueArgs>(args: SelectSubset<T, PackageAddonFindUniqueArgs<ExtArgs>>): Prisma__PackageAddonClient<$Result.GetResult<Prisma.$PackageAddonPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PackageAddon that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PackageAddonFindUniqueOrThrowArgs} args - Arguments to find a PackageAddon
     * @example
     * // Get one PackageAddon
     * const packageAddon = await prisma.packageAddon.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PackageAddonFindUniqueOrThrowArgs>(args: SelectSubset<T, PackageAddonFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PackageAddonClient<$Result.GetResult<Prisma.$PackageAddonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PackageAddon that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageAddonFindFirstArgs} args - Arguments to find a PackageAddon
     * @example
     * // Get one PackageAddon
     * const packageAddon = await prisma.packageAddon.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PackageAddonFindFirstArgs>(args?: SelectSubset<T, PackageAddonFindFirstArgs<ExtArgs>>): Prisma__PackageAddonClient<$Result.GetResult<Prisma.$PackageAddonPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PackageAddon that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageAddonFindFirstOrThrowArgs} args - Arguments to find a PackageAddon
     * @example
     * // Get one PackageAddon
     * const packageAddon = await prisma.packageAddon.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PackageAddonFindFirstOrThrowArgs>(args?: SelectSubset<T, PackageAddonFindFirstOrThrowArgs<ExtArgs>>): Prisma__PackageAddonClient<$Result.GetResult<Prisma.$PackageAddonPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PackageAddons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageAddonFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PackageAddons
     * const packageAddons = await prisma.packageAddon.findMany()
     * 
     * // Get first 10 PackageAddons
     * const packageAddons = await prisma.packageAddon.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const packageAddonWithIdOnly = await prisma.packageAddon.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PackageAddonFindManyArgs>(args?: SelectSubset<T, PackageAddonFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackageAddonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PackageAddon.
     * @param {PackageAddonCreateArgs} args - Arguments to create a PackageAddon.
     * @example
     * // Create one PackageAddon
     * const PackageAddon = await prisma.packageAddon.create({
     *   data: {
     *     // ... data to create a PackageAddon
     *   }
     * })
     * 
     */
    create<T extends PackageAddonCreateArgs>(args: SelectSubset<T, PackageAddonCreateArgs<ExtArgs>>): Prisma__PackageAddonClient<$Result.GetResult<Prisma.$PackageAddonPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PackageAddons.
     * @param {PackageAddonCreateManyArgs} args - Arguments to create many PackageAddons.
     * @example
     * // Create many PackageAddons
     * const packageAddon = await prisma.packageAddon.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PackageAddonCreateManyArgs>(args?: SelectSubset<T, PackageAddonCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PackageAddons and returns the data saved in the database.
     * @param {PackageAddonCreateManyAndReturnArgs} args - Arguments to create many PackageAddons.
     * @example
     * // Create many PackageAddons
     * const packageAddon = await prisma.packageAddon.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PackageAddons and only return the `id`
     * const packageAddonWithIdOnly = await prisma.packageAddon.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PackageAddonCreateManyAndReturnArgs>(args?: SelectSubset<T, PackageAddonCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackageAddonPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PackageAddon.
     * @param {PackageAddonDeleteArgs} args - Arguments to delete one PackageAddon.
     * @example
     * // Delete one PackageAddon
     * const PackageAddon = await prisma.packageAddon.delete({
     *   where: {
     *     // ... filter to delete one PackageAddon
     *   }
     * })
     * 
     */
    delete<T extends PackageAddonDeleteArgs>(args: SelectSubset<T, PackageAddonDeleteArgs<ExtArgs>>): Prisma__PackageAddonClient<$Result.GetResult<Prisma.$PackageAddonPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PackageAddon.
     * @param {PackageAddonUpdateArgs} args - Arguments to update one PackageAddon.
     * @example
     * // Update one PackageAddon
     * const packageAddon = await prisma.packageAddon.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PackageAddonUpdateArgs>(args: SelectSubset<T, PackageAddonUpdateArgs<ExtArgs>>): Prisma__PackageAddonClient<$Result.GetResult<Prisma.$PackageAddonPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PackageAddons.
     * @param {PackageAddonDeleteManyArgs} args - Arguments to filter PackageAddons to delete.
     * @example
     * // Delete a few PackageAddons
     * const { count } = await prisma.packageAddon.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PackageAddonDeleteManyArgs>(args?: SelectSubset<T, PackageAddonDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PackageAddons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageAddonUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PackageAddons
     * const packageAddon = await prisma.packageAddon.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PackageAddonUpdateManyArgs>(args: SelectSubset<T, PackageAddonUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PackageAddons and returns the data updated in the database.
     * @param {PackageAddonUpdateManyAndReturnArgs} args - Arguments to update many PackageAddons.
     * @example
     * // Update many PackageAddons
     * const packageAddon = await prisma.packageAddon.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PackageAddons and only return the `id`
     * const packageAddonWithIdOnly = await prisma.packageAddon.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PackageAddonUpdateManyAndReturnArgs>(args: SelectSubset<T, PackageAddonUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PackageAddonPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PackageAddon.
     * @param {PackageAddonUpsertArgs} args - Arguments to update or create a PackageAddon.
     * @example
     * // Update or create a PackageAddon
     * const packageAddon = await prisma.packageAddon.upsert({
     *   create: {
     *     // ... data to create a PackageAddon
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PackageAddon we want to update
     *   }
     * })
     */
    upsert<T extends PackageAddonUpsertArgs>(args: SelectSubset<T, PackageAddonUpsertArgs<ExtArgs>>): Prisma__PackageAddonClient<$Result.GetResult<Prisma.$PackageAddonPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PackageAddons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageAddonCountArgs} args - Arguments to filter PackageAddons to count.
     * @example
     * // Count the number of PackageAddons
     * const count = await prisma.packageAddon.count({
     *   where: {
     *     // ... the filter for the PackageAddons we want to count
     *   }
     * })
    **/
    count<T extends PackageAddonCountArgs>(
      args?: Subset<T, PackageAddonCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PackageAddonCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PackageAddon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageAddonAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PackageAddonAggregateArgs>(args: Subset<T, PackageAddonAggregateArgs>): Prisma.PrismaPromise<GetPackageAddonAggregateType<T>>

    /**
     * Group by PackageAddon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PackageAddonGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PackageAddonGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PackageAddonGroupByArgs['orderBy'] }
        : { orderBy?: PackageAddonGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PackageAddonGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPackageAddonGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PackageAddon model
   */
  readonly fields: PackageAddonFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PackageAddon.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PackageAddonClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    package<T extends PackageDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PackageDefaultArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PackageAddon model
   */
  interface PackageAddonFieldRefs {
    readonly id: FieldRef<"PackageAddon", 'String'>
    readonly packageId: FieldRef<"PackageAddon", 'String'>
    readonly name: FieldRef<"PackageAddon", 'String'>
    readonly description: FieldRef<"PackageAddon", 'String'>
    readonly price: FieldRef<"PackageAddon", 'Int'>
    readonly quantity: FieldRef<"PackageAddon", 'Int'>
    readonly createdAt: FieldRef<"PackageAddon", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PackageAddon findUnique
   */
  export type PackageAddonFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageAddon
     */
    select?: PackageAddonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PackageAddon
     */
    omit?: PackageAddonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageAddonInclude<ExtArgs> | null
    /**
     * Filter, which PackageAddon to fetch.
     */
    where: PackageAddonWhereUniqueInput
  }

  /**
   * PackageAddon findUniqueOrThrow
   */
  export type PackageAddonFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageAddon
     */
    select?: PackageAddonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PackageAddon
     */
    omit?: PackageAddonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageAddonInclude<ExtArgs> | null
    /**
     * Filter, which PackageAddon to fetch.
     */
    where: PackageAddonWhereUniqueInput
  }

  /**
   * PackageAddon findFirst
   */
  export type PackageAddonFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageAddon
     */
    select?: PackageAddonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PackageAddon
     */
    omit?: PackageAddonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageAddonInclude<ExtArgs> | null
    /**
     * Filter, which PackageAddon to fetch.
     */
    where?: PackageAddonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackageAddons to fetch.
     */
    orderBy?: PackageAddonOrderByWithRelationInput | PackageAddonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PackageAddons.
     */
    cursor?: PackageAddonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackageAddons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackageAddons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PackageAddons.
     */
    distinct?: PackageAddonScalarFieldEnum | PackageAddonScalarFieldEnum[]
  }

  /**
   * PackageAddon findFirstOrThrow
   */
  export type PackageAddonFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageAddon
     */
    select?: PackageAddonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PackageAddon
     */
    omit?: PackageAddonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageAddonInclude<ExtArgs> | null
    /**
     * Filter, which PackageAddon to fetch.
     */
    where?: PackageAddonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackageAddons to fetch.
     */
    orderBy?: PackageAddonOrderByWithRelationInput | PackageAddonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PackageAddons.
     */
    cursor?: PackageAddonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackageAddons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackageAddons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PackageAddons.
     */
    distinct?: PackageAddonScalarFieldEnum | PackageAddonScalarFieldEnum[]
  }

  /**
   * PackageAddon findMany
   */
  export type PackageAddonFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageAddon
     */
    select?: PackageAddonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PackageAddon
     */
    omit?: PackageAddonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageAddonInclude<ExtArgs> | null
    /**
     * Filter, which PackageAddons to fetch.
     */
    where?: PackageAddonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PackageAddons to fetch.
     */
    orderBy?: PackageAddonOrderByWithRelationInput | PackageAddonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PackageAddons.
     */
    cursor?: PackageAddonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PackageAddons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PackageAddons.
     */
    skip?: number
    distinct?: PackageAddonScalarFieldEnum | PackageAddonScalarFieldEnum[]
  }

  /**
   * PackageAddon create
   */
  export type PackageAddonCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageAddon
     */
    select?: PackageAddonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PackageAddon
     */
    omit?: PackageAddonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageAddonInclude<ExtArgs> | null
    /**
     * The data needed to create a PackageAddon.
     */
    data: XOR<PackageAddonCreateInput, PackageAddonUncheckedCreateInput>
  }

  /**
   * PackageAddon createMany
   */
  export type PackageAddonCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PackageAddons.
     */
    data: PackageAddonCreateManyInput | PackageAddonCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PackageAddon createManyAndReturn
   */
  export type PackageAddonCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageAddon
     */
    select?: PackageAddonSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PackageAddon
     */
    omit?: PackageAddonOmit<ExtArgs> | null
    /**
     * The data used to create many PackageAddons.
     */
    data: PackageAddonCreateManyInput | PackageAddonCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageAddonIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PackageAddon update
   */
  export type PackageAddonUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageAddon
     */
    select?: PackageAddonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PackageAddon
     */
    omit?: PackageAddonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageAddonInclude<ExtArgs> | null
    /**
     * The data needed to update a PackageAddon.
     */
    data: XOR<PackageAddonUpdateInput, PackageAddonUncheckedUpdateInput>
    /**
     * Choose, which PackageAddon to update.
     */
    where: PackageAddonWhereUniqueInput
  }

  /**
   * PackageAddon updateMany
   */
  export type PackageAddonUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PackageAddons.
     */
    data: XOR<PackageAddonUpdateManyMutationInput, PackageAddonUncheckedUpdateManyInput>
    /**
     * Filter which PackageAddons to update
     */
    where?: PackageAddonWhereInput
    /**
     * Limit how many PackageAddons to update.
     */
    limit?: number
  }

  /**
   * PackageAddon updateManyAndReturn
   */
  export type PackageAddonUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageAddon
     */
    select?: PackageAddonSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PackageAddon
     */
    omit?: PackageAddonOmit<ExtArgs> | null
    /**
     * The data used to update PackageAddons.
     */
    data: XOR<PackageAddonUpdateManyMutationInput, PackageAddonUncheckedUpdateManyInput>
    /**
     * Filter which PackageAddons to update
     */
    where?: PackageAddonWhereInput
    /**
     * Limit how many PackageAddons to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageAddonIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * PackageAddon upsert
   */
  export type PackageAddonUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageAddon
     */
    select?: PackageAddonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PackageAddon
     */
    omit?: PackageAddonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageAddonInclude<ExtArgs> | null
    /**
     * The filter to search for the PackageAddon to update in case it exists.
     */
    where: PackageAddonWhereUniqueInput
    /**
     * In case the PackageAddon found by the `where` argument doesn't exist, create a new PackageAddon with this data.
     */
    create: XOR<PackageAddonCreateInput, PackageAddonUncheckedCreateInput>
    /**
     * In case the PackageAddon was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PackageAddonUpdateInput, PackageAddonUncheckedUpdateInput>
  }

  /**
   * PackageAddon delete
   */
  export type PackageAddonDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageAddon
     */
    select?: PackageAddonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PackageAddon
     */
    omit?: PackageAddonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageAddonInclude<ExtArgs> | null
    /**
     * Filter which PackageAddon to delete.
     */
    where: PackageAddonWhereUniqueInput
  }

  /**
   * PackageAddon deleteMany
   */
  export type PackageAddonDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PackageAddons to delete
     */
    where?: PackageAddonWhereInput
    /**
     * Limit how many PackageAddons to delete.
     */
    limit?: number
  }

  /**
   * PackageAddon without action
   */
  export type PackageAddonDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PackageAddon
     */
    select?: PackageAddonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PackageAddon
     */
    omit?: PackageAddonOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageAddonInclude<ExtArgs> | null
  }


  /**
   * Model Shoot
   */

  export type AggregateShoot = {
    _count: ShootCountAggregateOutputType | null
    _min: ShootMinAggregateOutputType | null
    _max: ShootMaxAggregateOutputType | null
  }

  export type ShootMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    packageId: string | null
    date: Date | null
    startTime: string | null
    endTime: string | null
    shotListId: string | null
    sunsetTime: Date | null
    venueType: string | null
    venueName: string | null
    venueAddress: string | null
    lightingNotes: string | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ShootMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    packageId: string | null
    date: Date | null
    startTime: string | null
    endTime: string | null
    shotListId: string | null
    sunsetTime: Date | null
    venueType: string | null
    venueName: string | null
    venueAddress: string | null
    lightingNotes: string | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ShootCountAggregateOutputType = {
    id: number
    tenantId: number
    packageId: number
    date: number
    startTime: number
    endTime: number
    shotListId: number
    timeline: number
    locations: number
    sunsetTime: number
    weatherForecast: number
    venueType: number
    venueName: number
    venueAddress: number
    lightingNotes: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ShootMinAggregateInputType = {
    id?: true
    tenantId?: true
    packageId?: true
    date?: true
    startTime?: true
    endTime?: true
    shotListId?: true
    sunsetTime?: true
    venueType?: true
    venueName?: true
    venueAddress?: true
    lightingNotes?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ShootMaxAggregateInputType = {
    id?: true
    tenantId?: true
    packageId?: true
    date?: true
    startTime?: true
    endTime?: true
    shotListId?: true
    sunsetTime?: true
    venueType?: true
    venueName?: true
    venueAddress?: true
    lightingNotes?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ShootCountAggregateInputType = {
    id?: true
    tenantId?: true
    packageId?: true
    date?: true
    startTime?: true
    endTime?: true
    shotListId?: true
    timeline?: true
    locations?: true
    sunsetTime?: true
    weatherForecast?: true
    venueType?: true
    venueName?: true
    venueAddress?: true
    lightingNotes?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ShootAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Shoot to aggregate.
     */
    where?: ShootWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shoots to fetch.
     */
    orderBy?: ShootOrderByWithRelationInput | ShootOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ShootWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shoots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shoots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Shoots
    **/
    _count?: true | ShootCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ShootMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ShootMaxAggregateInputType
  }

  export type GetShootAggregateType<T extends ShootAggregateArgs> = {
        [P in keyof T & keyof AggregateShoot]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateShoot[P]>
      : GetScalarType<T[P], AggregateShoot[P]>
  }




  export type ShootGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShootWhereInput
    orderBy?: ShootOrderByWithAggregationInput | ShootOrderByWithAggregationInput[]
    by: ShootScalarFieldEnum[] | ShootScalarFieldEnum
    having?: ShootScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ShootCountAggregateInputType | true
    _min?: ShootMinAggregateInputType
    _max?: ShootMaxAggregateInputType
  }

  export type ShootGroupByOutputType = {
    id: string
    tenantId: string
    packageId: string
    date: Date
    startTime: string
    endTime: string
    shotListId: string | null
    timeline: JsonValue | null
    locations: JsonValue[]
    sunsetTime: Date | null
    weatherForecast: JsonValue | null
    venueType: string | null
    venueName: string | null
    venueAddress: string | null
    lightingNotes: string | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: ShootCountAggregateOutputType | null
    _min: ShootMinAggregateOutputType | null
    _max: ShootMaxAggregateOutputType | null
  }

  type GetShootGroupByPayload<T extends ShootGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ShootGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ShootGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ShootGroupByOutputType[P]>
            : GetScalarType<T[P], ShootGroupByOutputType[P]>
        }
      >
    >


  export type ShootSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    packageId?: boolean
    date?: boolean
    startTime?: boolean
    endTime?: boolean
    shotListId?: boolean
    timeline?: boolean
    locations?: boolean
    sunsetTime?: boolean
    weatherForecast?: boolean
    venueType?: boolean
    venueName?: boolean
    venueAddress?: boolean
    lightingNotes?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    package?: boolean | PackageDefaultArgs<ExtArgs>
    shotList?: boolean | Shoot$shotListArgs<ExtArgs>
    galleries?: boolean | Shoot$galleriesArgs<ExtArgs>
    _count?: boolean | ShootCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["shoot"]>

  export type ShootSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    packageId?: boolean
    date?: boolean
    startTime?: boolean
    endTime?: boolean
    shotListId?: boolean
    timeline?: boolean
    locations?: boolean
    sunsetTime?: boolean
    weatherForecast?: boolean
    venueType?: boolean
    venueName?: boolean
    venueAddress?: boolean
    lightingNotes?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    package?: boolean | PackageDefaultArgs<ExtArgs>
    shotList?: boolean | Shoot$shotListArgs<ExtArgs>
  }, ExtArgs["result"]["shoot"]>

  export type ShootSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    packageId?: boolean
    date?: boolean
    startTime?: boolean
    endTime?: boolean
    shotListId?: boolean
    timeline?: boolean
    locations?: boolean
    sunsetTime?: boolean
    weatherForecast?: boolean
    venueType?: boolean
    venueName?: boolean
    venueAddress?: boolean
    lightingNotes?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    package?: boolean | PackageDefaultArgs<ExtArgs>
    shotList?: boolean | Shoot$shotListArgs<ExtArgs>
  }, ExtArgs["result"]["shoot"]>

  export type ShootSelectScalar = {
    id?: boolean
    tenantId?: boolean
    packageId?: boolean
    date?: boolean
    startTime?: boolean
    endTime?: boolean
    shotListId?: boolean
    timeline?: boolean
    locations?: boolean
    sunsetTime?: boolean
    weatherForecast?: boolean
    venueType?: boolean
    venueName?: boolean
    venueAddress?: boolean
    lightingNotes?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ShootOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "packageId" | "date" | "startTime" | "endTime" | "shotListId" | "timeline" | "locations" | "sunsetTime" | "weatherForecast" | "venueType" | "venueName" | "venueAddress" | "lightingNotes" | "notes" | "createdAt" | "updatedAt", ExtArgs["result"]["shoot"]>
  export type ShootInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    package?: boolean | PackageDefaultArgs<ExtArgs>
    shotList?: boolean | Shoot$shotListArgs<ExtArgs>
    galleries?: boolean | Shoot$galleriesArgs<ExtArgs>
    _count?: boolean | ShootCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ShootIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    package?: boolean | PackageDefaultArgs<ExtArgs>
    shotList?: boolean | Shoot$shotListArgs<ExtArgs>
  }
  export type ShootIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    package?: boolean | PackageDefaultArgs<ExtArgs>
    shotList?: boolean | Shoot$shotListArgs<ExtArgs>
  }

  export type $ShootPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Shoot"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      package: Prisma.$PackagePayload<ExtArgs>
      shotList: Prisma.$ShotListPayload<ExtArgs> | null
      galleries: Prisma.$GalleryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      packageId: string
      date: Date
      startTime: string
      endTime: string
      shotListId: string | null
      timeline: Prisma.JsonValue | null
      locations: Prisma.JsonValue[]
      sunsetTime: Date | null
      weatherForecast: Prisma.JsonValue | null
      venueType: string | null
      venueName: string | null
      venueAddress: string | null
      lightingNotes: string | null
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["shoot"]>
    composites: {}
  }

  type ShootGetPayload<S extends boolean | null | undefined | ShootDefaultArgs> = $Result.GetResult<Prisma.$ShootPayload, S>

  type ShootCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ShootFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ShootCountAggregateInputType | true
    }

  export interface ShootDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Shoot'], meta: { name: 'Shoot' } }
    /**
     * Find zero or one Shoot that matches the filter.
     * @param {ShootFindUniqueArgs} args - Arguments to find a Shoot
     * @example
     * // Get one Shoot
     * const shoot = await prisma.shoot.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ShootFindUniqueArgs>(args: SelectSubset<T, ShootFindUniqueArgs<ExtArgs>>): Prisma__ShootClient<$Result.GetResult<Prisma.$ShootPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Shoot that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ShootFindUniqueOrThrowArgs} args - Arguments to find a Shoot
     * @example
     * // Get one Shoot
     * const shoot = await prisma.shoot.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ShootFindUniqueOrThrowArgs>(args: SelectSubset<T, ShootFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ShootClient<$Result.GetResult<Prisma.$ShootPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Shoot that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShootFindFirstArgs} args - Arguments to find a Shoot
     * @example
     * // Get one Shoot
     * const shoot = await prisma.shoot.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ShootFindFirstArgs>(args?: SelectSubset<T, ShootFindFirstArgs<ExtArgs>>): Prisma__ShootClient<$Result.GetResult<Prisma.$ShootPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Shoot that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShootFindFirstOrThrowArgs} args - Arguments to find a Shoot
     * @example
     * // Get one Shoot
     * const shoot = await prisma.shoot.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ShootFindFirstOrThrowArgs>(args?: SelectSubset<T, ShootFindFirstOrThrowArgs<ExtArgs>>): Prisma__ShootClient<$Result.GetResult<Prisma.$ShootPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Shoots that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShootFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Shoots
     * const shoots = await prisma.shoot.findMany()
     * 
     * // Get first 10 Shoots
     * const shoots = await prisma.shoot.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const shootWithIdOnly = await prisma.shoot.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ShootFindManyArgs>(args?: SelectSubset<T, ShootFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShootPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Shoot.
     * @param {ShootCreateArgs} args - Arguments to create a Shoot.
     * @example
     * // Create one Shoot
     * const Shoot = await prisma.shoot.create({
     *   data: {
     *     // ... data to create a Shoot
     *   }
     * })
     * 
     */
    create<T extends ShootCreateArgs>(args: SelectSubset<T, ShootCreateArgs<ExtArgs>>): Prisma__ShootClient<$Result.GetResult<Prisma.$ShootPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Shoots.
     * @param {ShootCreateManyArgs} args - Arguments to create many Shoots.
     * @example
     * // Create many Shoots
     * const shoot = await prisma.shoot.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ShootCreateManyArgs>(args?: SelectSubset<T, ShootCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Shoots and returns the data saved in the database.
     * @param {ShootCreateManyAndReturnArgs} args - Arguments to create many Shoots.
     * @example
     * // Create many Shoots
     * const shoot = await prisma.shoot.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Shoots and only return the `id`
     * const shootWithIdOnly = await prisma.shoot.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ShootCreateManyAndReturnArgs>(args?: SelectSubset<T, ShootCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShootPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Shoot.
     * @param {ShootDeleteArgs} args - Arguments to delete one Shoot.
     * @example
     * // Delete one Shoot
     * const Shoot = await prisma.shoot.delete({
     *   where: {
     *     // ... filter to delete one Shoot
     *   }
     * })
     * 
     */
    delete<T extends ShootDeleteArgs>(args: SelectSubset<T, ShootDeleteArgs<ExtArgs>>): Prisma__ShootClient<$Result.GetResult<Prisma.$ShootPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Shoot.
     * @param {ShootUpdateArgs} args - Arguments to update one Shoot.
     * @example
     * // Update one Shoot
     * const shoot = await prisma.shoot.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ShootUpdateArgs>(args: SelectSubset<T, ShootUpdateArgs<ExtArgs>>): Prisma__ShootClient<$Result.GetResult<Prisma.$ShootPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Shoots.
     * @param {ShootDeleteManyArgs} args - Arguments to filter Shoots to delete.
     * @example
     * // Delete a few Shoots
     * const { count } = await prisma.shoot.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ShootDeleteManyArgs>(args?: SelectSubset<T, ShootDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Shoots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShootUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Shoots
     * const shoot = await prisma.shoot.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ShootUpdateManyArgs>(args: SelectSubset<T, ShootUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Shoots and returns the data updated in the database.
     * @param {ShootUpdateManyAndReturnArgs} args - Arguments to update many Shoots.
     * @example
     * // Update many Shoots
     * const shoot = await prisma.shoot.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Shoots and only return the `id`
     * const shootWithIdOnly = await prisma.shoot.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ShootUpdateManyAndReturnArgs>(args: SelectSubset<T, ShootUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShootPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Shoot.
     * @param {ShootUpsertArgs} args - Arguments to update or create a Shoot.
     * @example
     * // Update or create a Shoot
     * const shoot = await prisma.shoot.upsert({
     *   create: {
     *     // ... data to create a Shoot
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Shoot we want to update
     *   }
     * })
     */
    upsert<T extends ShootUpsertArgs>(args: SelectSubset<T, ShootUpsertArgs<ExtArgs>>): Prisma__ShootClient<$Result.GetResult<Prisma.$ShootPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Shoots.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShootCountArgs} args - Arguments to filter Shoots to count.
     * @example
     * // Count the number of Shoots
     * const count = await prisma.shoot.count({
     *   where: {
     *     // ... the filter for the Shoots we want to count
     *   }
     * })
    **/
    count<T extends ShootCountArgs>(
      args?: Subset<T, ShootCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ShootCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Shoot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShootAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ShootAggregateArgs>(args: Subset<T, ShootAggregateArgs>): Prisma.PrismaPromise<GetShootAggregateType<T>>

    /**
     * Group by Shoot.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShootGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ShootGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ShootGroupByArgs['orderBy'] }
        : { orderBy?: ShootGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ShootGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetShootGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Shoot model
   */
  readonly fields: ShootFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Shoot.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ShootClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    package<T extends PackageDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PackageDefaultArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    shotList<T extends Shoot$shotListArgs<ExtArgs> = {}>(args?: Subset<T, Shoot$shotListArgs<ExtArgs>>): Prisma__ShotListClient<$Result.GetResult<Prisma.$ShotListPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    galleries<T extends Shoot$galleriesArgs<ExtArgs> = {}>(args?: Subset<T, Shoot$galleriesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GalleryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Shoot model
   */
  interface ShootFieldRefs {
    readonly id: FieldRef<"Shoot", 'String'>
    readonly tenantId: FieldRef<"Shoot", 'String'>
    readonly packageId: FieldRef<"Shoot", 'String'>
    readonly date: FieldRef<"Shoot", 'DateTime'>
    readonly startTime: FieldRef<"Shoot", 'String'>
    readonly endTime: FieldRef<"Shoot", 'String'>
    readonly shotListId: FieldRef<"Shoot", 'String'>
    readonly timeline: FieldRef<"Shoot", 'Json'>
    readonly locations: FieldRef<"Shoot", 'Json[]'>
    readonly sunsetTime: FieldRef<"Shoot", 'DateTime'>
    readonly weatherForecast: FieldRef<"Shoot", 'Json'>
    readonly venueType: FieldRef<"Shoot", 'String'>
    readonly venueName: FieldRef<"Shoot", 'String'>
    readonly venueAddress: FieldRef<"Shoot", 'String'>
    readonly lightingNotes: FieldRef<"Shoot", 'String'>
    readonly notes: FieldRef<"Shoot", 'String'>
    readonly createdAt: FieldRef<"Shoot", 'DateTime'>
    readonly updatedAt: FieldRef<"Shoot", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Shoot findUnique
   */
  export type ShootFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shoot
     */
    select?: ShootSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shoot
     */
    omit?: ShootOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShootInclude<ExtArgs> | null
    /**
     * Filter, which Shoot to fetch.
     */
    where: ShootWhereUniqueInput
  }

  /**
   * Shoot findUniqueOrThrow
   */
  export type ShootFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shoot
     */
    select?: ShootSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shoot
     */
    omit?: ShootOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShootInclude<ExtArgs> | null
    /**
     * Filter, which Shoot to fetch.
     */
    where: ShootWhereUniqueInput
  }

  /**
   * Shoot findFirst
   */
  export type ShootFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shoot
     */
    select?: ShootSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shoot
     */
    omit?: ShootOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShootInclude<ExtArgs> | null
    /**
     * Filter, which Shoot to fetch.
     */
    where?: ShootWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shoots to fetch.
     */
    orderBy?: ShootOrderByWithRelationInput | ShootOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Shoots.
     */
    cursor?: ShootWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shoots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shoots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Shoots.
     */
    distinct?: ShootScalarFieldEnum | ShootScalarFieldEnum[]
  }

  /**
   * Shoot findFirstOrThrow
   */
  export type ShootFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shoot
     */
    select?: ShootSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shoot
     */
    omit?: ShootOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShootInclude<ExtArgs> | null
    /**
     * Filter, which Shoot to fetch.
     */
    where?: ShootWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shoots to fetch.
     */
    orderBy?: ShootOrderByWithRelationInput | ShootOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Shoots.
     */
    cursor?: ShootWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shoots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shoots.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Shoots.
     */
    distinct?: ShootScalarFieldEnum | ShootScalarFieldEnum[]
  }

  /**
   * Shoot findMany
   */
  export type ShootFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shoot
     */
    select?: ShootSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shoot
     */
    omit?: ShootOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShootInclude<ExtArgs> | null
    /**
     * Filter, which Shoots to fetch.
     */
    where?: ShootWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Shoots to fetch.
     */
    orderBy?: ShootOrderByWithRelationInput | ShootOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Shoots.
     */
    cursor?: ShootWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Shoots from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Shoots.
     */
    skip?: number
    distinct?: ShootScalarFieldEnum | ShootScalarFieldEnum[]
  }

  /**
   * Shoot create
   */
  export type ShootCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shoot
     */
    select?: ShootSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shoot
     */
    omit?: ShootOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShootInclude<ExtArgs> | null
    /**
     * The data needed to create a Shoot.
     */
    data: XOR<ShootCreateInput, ShootUncheckedCreateInput>
  }

  /**
   * Shoot createMany
   */
  export type ShootCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Shoots.
     */
    data: ShootCreateManyInput | ShootCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Shoot createManyAndReturn
   */
  export type ShootCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shoot
     */
    select?: ShootSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Shoot
     */
    omit?: ShootOmit<ExtArgs> | null
    /**
     * The data used to create many Shoots.
     */
    data: ShootCreateManyInput | ShootCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShootIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Shoot update
   */
  export type ShootUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shoot
     */
    select?: ShootSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shoot
     */
    omit?: ShootOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShootInclude<ExtArgs> | null
    /**
     * The data needed to update a Shoot.
     */
    data: XOR<ShootUpdateInput, ShootUncheckedUpdateInput>
    /**
     * Choose, which Shoot to update.
     */
    where: ShootWhereUniqueInput
  }

  /**
   * Shoot updateMany
   */
  export type ShootUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Shoots.
     */
    data: XOR<ShootUpdateManyMutationInput, ShootUncheckedUpdateManyInput>
    /**
     * Filter which Shoots to update
     */
    where?: ShootWhereInput
    /**
     * Limit how many Shoots to update.
     */
    limit?: number
  }

  /**
   * Shoot updateManyAndReturn
   */
  export type ShootUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shoot
     */
    select?: ShootSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Shoot
     */
    omit?: ShootOmit<ExtArgs> | null
    /**
     * The data used to update Shoots.
     */
    data: XOR<ShootUpdateManyMutationInput, ShootUncheckedUpdateManyInput>
    /**
     * Filter which Shoots to update
     */
    where?: ShootWhereInput
    /**
     * Limit how many Shoots to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShootIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Shoot upsert
   */
  export type ShootUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shoot
     */
    select?: ShootSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shoot
     */
    omit?: ShootOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShootInclude<ExtArgs> | null
    /**
     * The filter to search for the Shoot to update in case it exists.
     */
    where: ShootWhereUniqueInput
    /**
     * In case the Shoot found by the `where` argument doesn't exist, create a new Shoot with this data.
     */
    create: XOR<ShootCreateInput, ShootUncheckedCreateInput>
    /**
     * In case the Shoot was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ShootUpdateInput, ShootUncheckedUpdateInput>
  }

  /**
   * Shoot delete
   */
  export type ShootDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shoot
     */
    select?: ShootSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shoot
     */
    omit?: ShootOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShootInclude<ExtArgs> | null
    /**
     * Filter which Shoot to delete.
     */
    where: ShootWhereUniqueInput
  }

  /**
   * Shoot deleteMany
   */
  export type ShootDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Shoots to delete
     */
    where?: ShootWhereInput
    /**
     * Limit how many Shoots to delete.
     */
    limit?: number
  }

  /**
   * Shoot.shotList
   */
  export type Shoot$shotListArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShotList
     */
    select?: ShotListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShotList
     */
    omit?: ShotListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShotListInclude<ExtArgs> | null
    where?: ShotListWhereInput
  }

  /**
   * Shoot.galleries
   */
  export type Shoot$galleriesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Gallery
     */
    select?: GallerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Gallery
     */
    omit?: GalleryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryInclude<ExtArgs> | null
    where?: GalleryWhereInput
    orderBy?: GalleryOrderByWithRelationInput | GalleryOrderByWithRelationInput[]
    cursor?: GalleryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GalleryScalarFieldEnum | GalleryScalarFieldEnum[]
  }

  /**
   * Shoot without action
   */
  export type ShootDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shoot
     */
    select?: ShootSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shoot
     */
    omit?: ShootOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShootInclude<ExtArgs> | null
  }


  /**
   * Model ShotList
   */

  export type AggregateShotList = {
    _count: ShotListCountAggregateOutputType | null
    _avg: ShotListAvgAggregateOutputType | null
    _sum: ShotListSumAggregateOutputType | null
    _min: ShotListMinAggregateOutputType | null
    _max: ShotListMaxAggregateOutputType | null
  }

  export type ShotListAvgAggregateOutputType = {
    totalShots: number | null
    mustHaveCount: number | null
    estimatedTime: number | null
  }

  export type ShotListSumAggregateOutputType = {
    totalShots: number | null
    mustHaveCount: number | null
    estimatedTime: number | null
  }

  export type ShotListMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    packageId: string | null
    name: string | null
    status: $Enums.ShotListStatus | null
    eventType: string | null
    aiGenerated: boolean | null
    totalShots: number | null
    mustHaveCount: number | null
    estimatedTime: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ShotListMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    packageId: string | null
    name: string | null
    status: $Enums.ShotListStatus | null
    eventType: string | null
    aiGenerated: boolean | null
    totalShots: number | null
    mustHaveCount: number | null
    estimatedTime: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ShotListCountAggregateOutputType = {
    id: number
    tenantId: number
    packageId: number
    name: number
    status: number
    eventType: number
    aiGenerated: number
    sections: number
    totalShots: number
    mustHaveCount: number
    estimatedTime: number
    equipmentList: number
    lightingPlan: number
    backupPlans: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ShotListAvgAggregateInputType = {
    totalShots?: true
    mustHaveCount?: true
    estimatedTime?: true
  }

  export type ShotListSumAggregateInputType = {
    totalShots?: true
    mustHaveCount?: true
    estimatedTime?: true
  }

  export type ShotListMinAggregateInputType = {
    id?: true
    tenantId?: true
    packageId?: true
    name?: true
    status?: true
    eventType?: true
    aiGenerated?: true
    totalShots?: true
    mustHaveCount?: true
    estimatedTime?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ShotListMaxAggregateInputType = {
    id?: true
    tenantId?: true
    packageId?: true
    name?: true
    status?: true
    eventType?: true
    aiGenerated?: true
    totalShots?: true
    mustHaveCount?: true
    estimatedTime?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ShotListCountAggregateInputType = {
    id?: true
    tenantId?: true
    packageId?: true
    name?: true
    status?: true
    eventType?: true
    aiGenerated?: true
    sections?: true
    totalShots?: true
    mustHaveCount?: true
    estimatedTime?: true
    equipmentList?: true
    lightingPlan?: true
    backupPlans?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ShotListAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ShotList to aggregate.
     */
    where?: ShotListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShotLists to fetch.
     */
    orderBy?: ShotListOrderByWithRelationInput | ShotListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ShotListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShotLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShotLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ShotLists
    **/
    _count?: true | ShotListCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ShotListAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ShotListSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ShotListMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ShotListMaxAggregateInputType
  }

  export type GetShotListAggregateType<T extends ShotListAggregateArgs> = {
        [P in keyof T & keyof AggregateShotList]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateShotList[P]>
      : GetScalarType<T[P], AggregateShotList[P]>
  }




  export type ShotListGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ShotListWhereInput
    orderBy?: ShotListOrderByWithAggregationInput | ShotListOrderByWithAggregationInput[]
    by: ShotListScalarFieldEnum[] | ShotListScalarFieldEnum
    having?: ShotListScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ShotListCountAggregateInputType | true
    _avg?: ShotListAvgAggregateInputType
    _sum?: ShotListSumAggregateInputType
    _min?: ShotListMinAggregateInputType
    _max?: ShotListMaxAggregateInputType
  }

  export type ShotListGroupByOutputType = {
    id: string
    tenantId: string
    packageId: string | null
    name: string
    status: $Enums.ShotListStatus
    eventType: string
    aiGenerated: boolean
    sections: JsonValue
    totalShots: number
    mustHaveCount: number
    estimatedTime: number | null
    equipmentList: JsonValue | null
    lightingPlan: JsonValue | null
    backupPlans: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: ShotListCountAggregateOutputType | null
    _avg: ShotListAvgAggregateOutputType | null
    _sum: ShotListSumAggregateOutputType | null
    _min: ShotListMinAggregateOutputType | null
    _max: ShotListMaxAggregateOutputType | null
  }

  type GetShotListGroupByPayload<T extends ShotListGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ShotListGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ShotListGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ShotListGroupByOutputType[P]>
            : GetScalarType<T[P], ShotListGroupByOutputType[P]>
        }
      >
    >


  export type ShotListSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    packageId?: boolean
    name?: boolean
    status?: boolean
    eventType?: boolean
    aiGenerated?: boolean
    sections?: boolean
    totalShots?: boolean
    mustHaveCount?: boolean
    estimatedTime?: boolean
    equipmentList?: boolean
    lightingPlan?: boolean
    backupPlans?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    package?: boolean | ShotList$packageArgs<ExtArgs>
    shoot?: boolean | ShotList$shootArgs<ExtArgs>
  }, ExtArgs["result"]["shotList"]>

  export type ShotListSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    packageId?: boolean
    name?: boolean
    status?: boolean
    eventType?: boolean
    aiGenerated?: boolean
    sections?: boolean
    totalShots?: boolean
    mustHaveCount?: boolean
    estimatedTime?: boolean
    equipmentList?: boolean
    lightingPlan?: boolean
    backupPlans?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    package?: boolean | ShotList$packageArgs<ExtArgs>
  }, ExtArgs["result"]["shotList"]>

  export type ShotListSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    packageId?: boolean
    name?: boolean
    status?: boolean
    eventType?: boolean
    aiGenerated?: boolean
    sections?: boolean
    totalShots?: boolean
    mustHaveCount?: boolean
    estimatedTime?: boolean
    equipmentList?: boolean
    lightingPlan?: boolean
    backupPlans?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    package?: boolean | ShotList$packageArgs<ExtArgs>
  }, ExtArgs["result"]["shotList"]>

  export type ShotListSelectScalar = {
    id?: boolean
    tenantId?: boolean
    packageId?: boolean
    name?: boolean
    status?: boolean
    eventType?: boolean
    aiGenerated?: boolean
    sections?: boolean
    totalShots?: boolean
    mustHaveCount?: boolean
    estimatedTime?: boolean
    equipmentList?: boolean
    lightingPlan?: boolean
    backupPlans?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ShotListOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "packageId" | "name" | "status" | "eventType" | "aiGenerated" | "sections" | "totalShots" | "mustHaveCount" | "estimatedTime" | "equipmentList" | "lightingPlan" | "backupPlans" | "createdAt" | "updatedAt", ExtArgs["result"]["shotList"]>
  export type ShotListInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    package?: boolean | ShotList$packageArgs<ExtArgs>
    shoot?: boolean | ShotList$shootArgs<ExtArgs>
  }
  export type ShotListIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    package?: boolean | ShotList$packageArgs<ExtArgs>
  }
  export type ShotListIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    package?: boolean | ShotList$packageArgs<ExtArgs>
  }

  export type $ShotListPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ShotList"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      package: Prisma.$PackagePayload<ExtArgs> | null
      shoot: Prisma.$ShootPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      packageId: string | null
      name: string
      status: $Enums.ShotListStatus
      eventType: string
      aiGenerated: boolean
      sections: Prisma.JsonValue
      totalShots: number
      mustHaveCount: number
      estimatedTime: number | null
      equipmentList: Prisma.JsonValue | null
      lightingPlan: Prisma.JsonValue | null
      backupPlans: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["shotList"]>
    composites: {}
  }

  type ShotListGetPayload<S extends boolean | null | undefined | ShotListDefaultArgs> = $Result.GetResult<Prisma.$ShotListPayload, S>

  type ShotListCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ShotListFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ShotListCountAggregateInputType | true
    }

  export interface ShotListDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ShotList'], meta: { name: 'ShotList' } }
    /**
     * Find zero or one ShotList that matches the filter.
     * @param {ShotListFindUniqueArgs} args - Arguments to find a ShotList
     * @example
     * // Get one ShotList
     * const shotList = await prisma.shotList.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ShotListFindUniqueArgs>(args: SelectSubset<T, ShotListFindUniqueArgs<ExtArgs>>): Prisma__ShotListClient<$Result.GetResult<Prisma.$ShotListPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ShotList that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ShotListFindUniqueOrThrowArgs} args - Arguments to find a ShotList
     * @example
     * // Get one ShotList
     * const shotList = await prisma.shotList.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ShotListFindUniqueOrThrowArgs>(args: SelectSubset<T, ShotListFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ShotListClient<$Result.GetResult<Prisma.$ShotListPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ShotList that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShotListFindFirstArgs} args - Arguments to find a ShotList
     * @example
     * // Get one ShotList
     * const shotList = await prisma.shotList.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ShotListFindFirstArgs>(args?: SelectSubset<T, ShotListFindFirstArgs<ExtArgs>>): Prisma__ShotListClient<$Result.GetResult<Prisma.$ShotListPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ShotList that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShotListFindFirstOrThrowArgs} args - Arguments to find a ShotList
     * @example
     * // Get one ShotList
     * const shotList = await prisma.shotList.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ShotListFindFirstOrThrowArgs>(args?: SelectSubset<T, ShotListFindFirstOrThrowArgs<ExtArgs>>): Prisma__ShotListClient<$Result.GetResult<Prisma.$ShotListPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ShotLists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShotListFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ShotLists
     * const shotLists = await prisma.shotList.findMany()
     * 
     * // Get first 10 ShotLists
     * const shotLists = await prisma.shotList.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const shotListWithIdOnly = await prisma.shotList.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ShotListFindManyArgs>(args?: SelectSubset<T, ShotListFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShotListPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ShotList.
     * @param {ShotListCreateArgs} args - Arguments to create a ShotList.
     * @example
     * // Create one ShotList
     * const ShotList = await prisma.shotList.create({
     *   data: {
     *     // ... data to create a ShotList
     *   }
     * })
     * 
     */
    create<T extends ShotListCreateArgs>(args: SelectSubset<T, ShotListCreateArgs<ExtArgs>>): Prisma__ShotListClient<$Result.GetResult<Prisma.$ShotListPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ShotLists.
     * @param {ShotListCreateManyArgs} args - Arguments to create many ShotLists.
     * @example
     * // Create many ShotLists
     * const shotList = await prisma.shotList.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ShotListCreateManyArgs>(args?: SelectSubset<T, ShotListCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ShotLists and returns the data saved in the database.
     * @param {ShotListCreateManyAndReturnArgs} args - Arguments to create many ShotLists.
     * @example
     * // Create many ShotLists
     * const shotList = await prisma.shotList.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ShotLists and only return the `id`
     * const shotListWithIdOnly = await prisma.shotList.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ShotListCreateManyAndReturnArgs>(args?: SelectSubset<T, ShotListCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShotListPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ShotList.
     * @param {ShotListDeleteArgs} args - Arguments to delete one ShotList.
     * @example
     * // Delete one ShotList
     * const ShotList = await prisma.shotList.delete({
     *   where: {
     *     // ... filter to delete one ShotList
     *   }
     * })
     * 
     */
    delete<T extends ShotListDeleteArgs>(args: SelectSubset<T, ShotListDeleteArgs<ExtArgs>>): Prisma__ShotListClient<$Result.GetResult<Prisma.$ShotListPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ShotList.
     * @param {ShotListUpdateArgs} args - Arguments to update one ShotList.
     * @example
     * // Update one ShotList
     * const shotList = await prisma.shotList.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ShotListUpdateArgs>(args: SelectSubset<T, ShotListUpdateArgs<ExtArgs>>): Prisma__ShotListClient<$Result.GetResult<Prisma.$ShotListPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ShotLists.
     * @param {ShotListDeleteManyArgs} args - Arguments to filter ShotLists to delete.
     * @example
     * // Delete a few ShotLists
     * const { count } = await prisma.shotList.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ShotListDeleteManyArgs>(args?: SelectSubset<T, ShotListDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ShotLists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShotListUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ShotLists
     * const shotList = await prisma.shotList.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ShotListUpdateManyArgs>(args: SelectSubset<T, ShotListUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ShotLists and returns the data updated in the database.
     * @param {ShotListUpdateManyAndReturnArgs} args - Arguments to update many ShotLists.
     * @example
     * // Update many ShotLists
     * const shotList = await prisma.shotList.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ShotLists and only return the `id`
     * const shotListWithIdOnly = await prisma.shotList.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ShotListUpdateManyAndReturnArgs>(args: SelectSubset<T, ShotListUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ShotListPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ShotList.
     * @param {ShotListUpsertArgs} args - Arguments to update or create a ShotList.
     * @example
     * // Update or create a ShotList
     * const shotList = await prisma.shotList.upsert({
     *   create: {
     *     // ... data to create a ShotList
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ShotList we want to update
     *   }
     * })
     */
    upsert<T extends ShotListUpsertArgs>(args: SelectSubset<T, ShotListUpsertArgs<ExtArgs>>): Prisma__ShotListClient<$Result.GetResult<Prisma.$ShotListPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ShotLists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShotListCountArgs} args - Arguments to filter ShotLists to count.
     * @example
     * // Count the number of ShotLists
     * const count = await prisma.shotList.count({
     *   where: {
     *     // ... the filter for the ShotLists we want to count
     *   }
     * })
    **/
    count<T extends ShotListCountArgs>(
      args?: Subset<T, ShotListCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ShotListCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ShotList.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShotListAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ShotListAggregateArgs>(args: Subset<T, ShotListAggregateArgs>): Prisma.PrismaPromise<GetShotListAggregateType<T>>

    /**
     * Group by ShotList.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ShotListGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ShotListGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ShotListGroupByArgs['orderBy'] }
        : { orderBy?: ShotListGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ShotListGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetShotListGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ShotList model
   */
  readonly fields: ShotListFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ShotList.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ShotListClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    package<T extends ShotList$packageArgs<ExtArgs> = {}>(args?: Subset<T, ShotList$packageArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    shoot<T extends ShotList$shootArgs<ExtArgs> = {}>(args?: Subset<T, ShotList$shootArgs<ExtArgs>>): Prisma__ShootClient<$Result.GetResult<Prisma.$ShootPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ShotList model
   */
  interface ShotListFieldRefs {
    readonly id: FieldRef<"ShotList", 'String'>
    readonly tenantId: FieldRef<"ShotList", 'String'>
    readonly packageId: FieldRef<"ShotList", 'String'>
    readonly name: FieldRef<"ShotList", 'String'>
    readonly status: FieldRef<"ShotList", 'ShotListStatus'>
    readonly eventType: FieldRef<"ShotList", 'String'>
    readonly aiGenerated: FieldRef<"ShotList", 'Boolean'>
    readonly sections: FieldRef<"ShotList", 'Json'>
    readonly totalShots: FieldRef<"ShotList", 'Int'>
    readonly mustHaveCount: FieldRef<"ShotList", 'Int'>
    readonly estimatedTime: FieldRef<"ShotList", 'Int'>
    readonly equipmentList: FieldRef<"ShotList", 'Json'>
    readonly lightingPlan: FieldRef<"ShotList", 'Json'>
    readonly backupPlans: FieldRef<"ShotList", 'Json'>
    readonly createdAt: FieldRef<"ShotList", 'DateTime'>
    readonly updatedAt: FieldRef<"ShotList", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ShotList findUnique
   */
  export type ShotListFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShotList
     */
    select?: ShotListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShotList
     */
    omit?: ShotListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShotListInclude<ExtArgs> | null
    /**
     * Filter, which ShotList to fetch.
     */
    where: ShotListWhereUniqueInput
  }

  /**
   * ShotList findUniqueOrThrow
   */
  export type ShotListFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShotList
     */
    select?: ShotListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShotList
     */
    omit?: ShotListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShotListInclude<ExtArgs> | null
    /**
     * Filter, which ShotList to fetch.
     */
    where: ShotListWhereUniqueInput
  }

  /**
   * ShotList findFirst
   */
  export type ShotListFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShotList
     */
    select?: ShotListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShotList
     */
    omit?: ShotListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShotListInclude<ExtArgs> | null
    /**
     * Filter, which ShotList to fetch.
     */
    where?: ShotListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShotLists to fetch.
     */
    orderBy?: ShotListOrderByWithRelationInput | ShotListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ShotLists.
     */
    cursor?: ShotListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShotLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShotLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ShotLists.
     */
    distinct?: ShotListScalarFieldEnum | ShotListScalarFieldEnum[]
  }

  /**
   * ShotList findFirstOrThrow
   */
  export type ShotListFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShotList
     */
    select?: ShotListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShotList
     */
    omit?: ShotListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShotListInclude<ExtArgs> | null
    /**
     * Filter, which ShotList to fetch.
     */
    where?: ShotListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShotLists to fetch.
     */
    orderBy?: ShotListOrderByWithRelationInput | ShotListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ShotLists.
     */
    cursor?: ShotListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShotLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShotLists.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ShotLists.
     */
    distinct?: ShotListScalarFieldEnum | ShotListScalarFieldEnum[]
  }

  /**
   * ShotList findMany
   */
  export type ShotListFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShotList
     */
    select?: ShotListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShotList
     */
    omit?: ShotListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShotListInclude<ExtArgs> | null
    /**
     * Filter, which ShotLists to fetch.
     */
    where?: ShotListWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ShotLists to fetch.
     */
    orderBy?: ShotListOrderByWithRelationInput | ShotListOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ShotLists.
     */
    cursor?: ShotListWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ShotLists from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ShotLists.
     */
    skip?: number
    distinct?: ShotListScalarFieldEnum | ShotListScalarFieldEnum[]
  }

  /**
   * ShotList create
   */
  export type ShotListCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShotList
     */
    select?: ShotListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShotList
     */
    omit?: ShotListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShotListInclude<ExtArgs> | null
    /**
     * The data needed to create a ShotList.
     */
    data: XOR<ShotListCreateInput, ShotListUncheckedCreateInput>
  }

  /**
   * ShotList createMany
   */
  export type ShotListCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ShotLists.
     */
    data: ShotListCreateManyInput | ShotListCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ShotList createManyAndReturn
   */
  export type ShotListCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShotList
     */
    select?: ShotListSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ShotList
     */
    omit?: ShotListOmit<ExtArgs> | null
    /**
     * The data used to create many ShotLists.
     */
    data: ShotListCreateManyInput | ShotListCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShotListIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ShotList update
   */
  export type ShotListUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShotList
     */
    select?: ShotListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShotList
     */
    omit?: ShotListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShotListInclude<ExtArgs> | null
    /**
     * The data needed to update a ShotList.
     */
    data: XOR<ShotListUpdateInput, ShotListUncheckedUpdateInput>
    /**
     * Choose, which ShotList to update.
     */
    where: ShotListWhereUniqueInput
  }

  /**
   * ShotList updateMany
   */
  export type ShotListUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ShotLists.
     */
    data: XOR<ShotListUpdateManyMutationInput, ShotListUncheckedUpdateManyInput>
    /**
     * Filter which ShotLists to update
     */
    where?: ShotListWhereInput
    /**
     * Limit how many ShotLists to update.
     */
    limit?: number
  }

  /**
   * ShotList updateManyAndReturn
   */
  export type ShotListUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShotList
     */
    select?: ShotListSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ShotList
     */
    omit?: ShotListOmit<ExtArgs> | null
    /**
     * The data used to update ShotLists.
     */
    data: XOR<ShotListUpdateManyMutationInput, ShotListUncheckedUpdateManyInput>
    /**
     * Filter which ShotLists to update
     */
    where?: ShotListWhereInput
    /**
     * Limit how many ShotLists to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShotListIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ShotList upsert
   */
  export type ShotListUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShotList
     */
    select?: ShotListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShotList
     */
    omit?: ShotListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShotListInclude<ExtArgs> | null
    /**
     * The filter to search for the ShotList to update in case it exists.
     */
    where: ShotListWhereUniqueInput
    /**
     * In case the ShotList found by the `where` argument doesn't exist, create a new ShotList with this data.
     */
    create: XOR<ShotListCreateInput, ShotListUncheckedCreateInput>
    /**
     * In case the ShotList was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ShotListUpdateInput, ShotListUncheckedUpdateInput>
  }

  /**
   * ShotList delete
   */
  export type ShotListDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShotList
     */
    select?: ShotListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShotList
     */
    omit?: ShotListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShotListInclude<ExtArgs> | null
    /**
     * Filter which ShotList to delete.
     */
    where: ShotListWhereUniqueInput
  }

  /**
   * ShotList deleteMany
   */
  export type ShotListDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ShotLists to delete
     */
    where?: ShotListWhereInput
    /**
     * Limit how many ShotLists to delete.
     */
    limit?: number
  }

  /**
   * ShotList.package
   */
  export type ShotList$packageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Package
     */
    omit?: PackageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    where?: PackageWhereInput
  }

  /**
   * ShotList.shoot
   */
  export type ShotList$shootArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Shoot
     */
    select?: ShootSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Shoot
     */
    omit?: ShootOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShootInclude<ExtArgs> | null
    where?: ShootWhereInput
  }

  /**
   * ShotList without action
   */
  export type ShotListDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ShotList
     */
    select?: ShotListSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ShotList
     */
    omit?: ShotListOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ShotListInclude<ExtArgs> | null
  }


  /**
   * Model Gallery
   */

  export type AggregateGallery = {
    _count: GalleryCountAggregateOutputType | null
    _avg: GalleryAvgAggregateOutputType | null
    _sum: GallerySumAggregateOutputType | null
    _min: GalleryMinAggregateOutputType | null
    _max: GalleryMaxAggregateOutputType | null
  }

  export type GalleryAvgAggregateOutputType = {
    totalPhotos: number | null
    selectedPhotos: number | null
  }

  export type GallerySumAggregateOutputType = {
    totalPhotos: number | null
    selectedPhotos: number | null
  }

  export type GalleryMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    shootId: string | null
    name: string | null
    status: $Enums.GalleryStatus | null
    totalPhotos: number | null
    selectedPhotos: number | null
    aiCurated: boolean | null
    publicUrl: string | null
    password: string | null
    expiresAt: Date | null
    downloadEnabled: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GalleryMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    shootId: string | null
    name: string | null
    status: $Enums.GalleryStatus | null
    totalPhotos: number | null
    selectedPhotos: number | null
    aiCurated: boolean | null
    publicUrl: string | null
    password: string | null
    expiresAt: Date | null
    downloadEnabled: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GalleryCountAggregateOutputType = {
    id: number
    tenantId: number
    shootId: number
    name: number
    status: number
    totalPhotos: number
    selectedPhotos: number
    aiCurated: number
    curationData: number
    publicUrl: number
    password: number
    expiresAt: number
    downloadEnabled: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GalleryAvgAggregateInputType = {
    totalPhotos?: true
    selectedPhotos?: true
  }

  export type GallerySumAggregateInputType = {
    totalPhotos?: true
    selectedPhotos?: true
  }

  export type GalleryMinAggregateInputType = {
    id?: true
    tenantId?: true
    shootId?: true
    name?: true
    status?: true
    totalPhotos?: true
    selectedPhotos?: true
    aiCurated?: true
    publicUrl?: true
    password?: true
    expiresAt?: true
    downloadEnabled?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GalleryMaxAggregateInputType = {
    id?: true
    tenantId?: true
    shootId?: true
    name?: true
    status?: true
    totalPhotos?: true
    selectedPhotos?: true
    aiCurated?: true
    publicUrl?: true
    password?: true
    expiresAt?: true
    downloadEnabled?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GalleryCountAggregateInputType = {
    id?: true
    tenantId?: true
    shootId?: true
    name?: true
    status?: true
    totalPhotos?: true
    selectedPhotos?: true
    aiCurated?: true
    curationData?: true
    publicUrl?: true
    password?: true
    expiresAt?: true
    downloadEnabled?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GalleryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Gallery to aggregate.
     */
    where?: GalleryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Galleries to fetch.
     */
    orderBy?: GalleryOrderByWithRelationInput | GalleryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GalleryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Galleries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Galleries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Galleries
    **/
    _count?: true | GalleryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GalleryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GallerySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GalleryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GalleryMaxAggregateInputType
  }

  export type GetGalleryAggregateType<T extends GalleryAggregateArgs> = {
        [P in keyof T & keyof AggregateGallery]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGallery[P]>
      : GetScalarType<T[P], AggregateGallery[P]>
  }




  export type GalleryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GalleryWhereInput
    orderBy?: GalleryOrderByWithAggregationInput | GalleryOrderByWithAggregationInput[]
    by: GalleryScalarFieldEnum[] | GalleryScalarFieldEnum
    having?: GalleryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GalleryCountAggregateInputType | true
    _avg?: GalleryAvgAggregateInputType
    _sum?: GallerySumAggregateInputType
    _min?: GalleryMinAggregateInputType
    _max?: GalleryMaxAggregateInputType
  }

  export type GalleryGroupByOutputType = {
    id: string
    tenantId: string
    shootId: string
    name: string
    status: $Enums.GalleryStatus
    totalPhotos: number
    selectedPhotos: number
    aiCurated: boolean
    curationData: JsonValue | null
    publicUrl: string | null
    password: string | null
    expiresAt: Date | null
    downloadEnabled: boolean
    createdAt: Date
    updatedAt: Date
    _count: GalleryCountAggregateOutputType | null
    _avg: GalleryAvgAggregateOutputType | null
    _sum: GallerySumAggregateOutputType | null
    _min: GalleryMinAggregateOutputType | null
    _max: GalleryMaxAggregateOutputType | null
  }

  type GetGalleryGroupByPayload<T extends GalleryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GalleryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GalleryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GalleryGroupByOutputType[P]>
            : GetScalarType<T[P], GalleryGroupByOutputType[P]>
        }
      >
    >


  export type GallerySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    shootId?: boolean
    name?: boolean
    status?: boolean
    totalPhotos?: boolean
    selectedPhotos?: boolean
    aiCurated?: boolean
    curationData?: boolean
    publicUrl?: boolean
    password?: boolean
    expiresAt?: boolean
    downloadEnabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    shoot?: boolean | ShootDefaultArgs<ExtArgs>
    photos?: boolean | Gallery$photosArgs<ExtArgs>
    _count?: boolean | GalleryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gallery"]>

  export type GallerySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    shootId?: boolean
    name?: boolean
    status?: boolean
    totalPhotos?: boolean
    selectedPhotos?: boolean
    aiCurated?: boolean
    curationData?: boolean
    publicUrl?: boolean
    password?: boolean
    expiresAt?: boolean
    downloadEnabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    shoot?: boolean | ShootDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gallery"]>

  export type GallerySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    shootId?: boolean
    name?: boolean
    status?: boolean
    totalPhotos?: boolean
    selectedPhotos?: boolean
    aiCurated?: boolean
    curationData?: boolean
    publicUrl?: boolean
    password?: boolean
    expiresAt?: boolean
    downloadEnabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    shoot?: boolean | ShootDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gallery"]>

  export type GallerySelectScalar = {
    id?: boolean
    tenantId?: boolean
    shootId?: boolean
    name?: boolean
    status?: boolean
    totalPhotos?: boolean
    selectedPhotos?: boolean
    aiCurated?: boolean
    curationData?: boolean
    publicUrl?: boolean
    password?: boolean
    expiresAt?: boolean
    downloadEnabled?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type GalleryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "shootId" | "name" | "status" | "totalPhotos" | "selectedPhotos" | "aiCurated" | "curationData" | "publicUrl" | "password" | "expiresAt" | "downloadEnabled" | "createdAt" | "updatedAt", ExtArgs["result"]["gallery"]>
  export type GalleryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    shoot?: boolean | ShootDefaultArgs<ExtArgs>
    photos?: boolean | Gallery$photosArgs<ExtArgs>
    _count?: boolean | GalleryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type GalleryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    shoot?: boolean | ShootDefaultArgs<ExtArgs>
  }
  export type GalleryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    shoot?: boolean | ShootDefaultArgs<ExtArgs>
  }

  export type $GalleryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Gallery"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      shoot: Prisma.$ShootPayload<ExtArgs>
      photos: Prisma.$GalleryPhotoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      shootId: string
      name: string
      status: $Enums.GalleryStatus
      totalPhotos: number
      selectedPhotos: number
      aiCurated: boolean
      curationData: Prisma.JsonValue | null
      publicUrl: string | null
      password: string | null
      expiresAt: Date | null
      downloadEnabled: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["gallery"]>
    composites: {}
  }

  type GalleryGetPayload<S extends boolean | null | undefined | GalleryDefaultArgs> = $Result.GetResult<Prisma.$GalleryPayload, S>

  type GalleryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GalleryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GalleryCountAggregateInputType | true
    }

  export interface GalleryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Gallery'], meta: { name: 'Gallery' } }
    /**
     * Find zero or one Gallery that matches the filter.
     * @param {GalleryFindUniqueArgs} args - Arguments to find a Gallery
     * @example
     * // Get one Gallery
     * const gallery = await prisma.gallery.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GalleryFindUniqueArgs>(args: SelectSubset<T, GalleryFindUniqueArgs<ExtArgs>>): Prisma__GalleryClient<$Result.GetResult<Prisma.$GalleryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Gallery that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GalleryFindUniqueOrThrowArgs} args - Arguments to find a Gallery
     * @example
     * // Get one Gallery
     * const gallery = await prisma.gallery.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GalleryFindUniqueOrThrowArgs>(args: SelectSubset<T, GalleryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GalleryClient<$Result.GetResult<Prisma.$GalleryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Gallery that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GalleryFindFirstArgs} args - Arguments to find a Gallery
     * @example
     * // Get one Gallery
     * const gallery = await prisma.gallery.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GalleryFindFirstArgs>(args?: SelectSubset<T, GalleryFindFirstArgs<ExtArgs>>): Prisma__GalleryClient<$Result.GetResult<Prisma.$GalleryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Gallery that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GalleryFindFirstOrThrowArgs} args - Arguments to find a Gallery
     * @example
     * // Get one Gallery
     * const gallery = await prisma.gallery.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GalleryFindFirstOrThrowArgs>(args?: SelectSubset<T, GalleryFindFirstOrThrowArgs<ExtArgs>>): Prisma__GalleryClient<$Result.GetResult<Prisma.$GalleryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Galleries that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GalleryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Galleries
     * const galleries = await prisma.gallery.findMany()
     * 
     * // Get first 10 Galleries
     * const galleries = await prisma.gallery.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const galleryWithIdOnly = await prisma.gallery.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GalleryFindManyArgs>(args?: SelectSubset<T, GalleryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GalleryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Gallery.
     * @param {GalleryCreateArgs} args - Arguments to create a Gallery.
     * @example
     * // Create one Gallery
     * const Gallery = await prisma.gallery.create({
     *   data: {
     *     // ... data to create a Gallery
     *   }
     * })
     * 
     */
    create<T extends GalleryCreateArgs>(args: SelectSubset<T, GalleryCreateArgs<ExtArgs>>): Prisma__GalleryClient<$Result.GetResult<Prisma.$GalleryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Galleries.
     * @param {GalleryCreateManyArgs} args - Arguments to create many Galleries.
     * @example
     * // Create many Galleries
     * const gallery = await prisma.gallery.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GalleryCreateManyArgs>(args?: SelectSubset<T, GalleryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Galleries and returns the data saved in the database.
     * @param {GalleryCreateManyAndReturnArgs} args - Arguments to create many Galleries.
     * @example
     * // Create many Galleries
     * const gallery = await prisma.gallery.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Galleries and only return the `id`
     * const galleryWithIdOnly = await prisma.gallery.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GalleryCreateManyAndReturnArgs>(args?: SelectSubset<T, GalleryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GalleryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Gallery.
     * @param {GalleryDeleteArgs} args - Arguments to delete one Gallery.
     * @example
     * // Delete one Gallery
     * const Gallery = await prisma.gallery.delete({
     *   where: {
     *     // ... filter to delete one Gallery
     *   }
     * })
     * 
     */
    delete<T extends GalleryDeleteArgs>(args: SelectSubset<T, GalleryDeleteArgs<ExtArgs>>): Prisma__GalleryClient<$Result.GetResult<Prisma.$GalleryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Gallery.
     * @param {GalleryUpdateArgs} args - Arguments to update one Gallery.
     * @example
     * // Update one Gallery
     * const gallery = await prisma.gallery.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GalleryUpdateArgs>(args: SelectSubset<T, GalleryUpdateArgs<ExtArgs>>): Prisma__GalleryClient<$Result.GetResult<Prisma.$GalleryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Galleries.
     * @param {GalleryDeleteManyArgs} args - Arguments to filter Galleries to delete.
     * @example
     * // Delete a few Galleries
     * const { count } = await prisma.gallery.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GalleryDeleteManyArgs>(args?: SelectSubset<T, GalleryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Galleries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GalleryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Galleries
     * const gallery = await prisma.gallery.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GalleryUpdateManyArgs>(args: SelectSubset<T, GalleryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Galleries and returns the data updated in the database.
     * @param {GalleryUpdateManyAndReturnArgs} args - Arguments to update many Galleries.
     * @example
     * // Update many Galleries
     * const gallery = await prisma.gallery.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Galleries and only return the `id`
     * const galleryWithIdOnly = await prisma.gallery.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GalleryUpdateManyAndReturnArgs>(args: SelectSubset<T, GalleryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GalleryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Gallery.
     * @param {GalleryUpsertArgs} args - Arguments to update or create a Gallery.
     * @example
     * // Update or create a Gallery
     * const gallery = await prisma.gallery.upsert({
     *   create: {
     *     // ... data to create a Gallery
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Gallery we want to update
     *   }
     * })
     */
    upsert<T extends GalleryUpsertArgs>(args: SelectSubset<T, GalleryUpsertArgs<ExtArgs>>): Prisma__GalleryClient<$Result.GetResult<Prisma.$GalleryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Galleries.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GalleryCountArgs} args - Arguments to filter Galleries to count.
     * @example
     * // Count the number of Galleries
     * const count = await prisma.gallery.count({
     *   where: {
     *     // ... the filter for the Galleries we want to count
     *   }
     * })
    **/
    count<T extends GalleryCountArgs>(
      args?: Subset<T, GalleryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GalleryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Gallery.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GalleryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GalleryAggregateArgs>(args: Subset<T, GalleryAggregateArgs>): Prisma.PrismaPromise<GetGalleryAggregateType<T>>

    /**
     * Group by Gallery.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GalleryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GalleryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GalleryGroupByArgs['orderBy'] }
        : { orderBy?: GalleryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GalleryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGalleryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Gallery model
   */
  readonly fields: GalleryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Gallery.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GalleryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    shoot<T extends ShootDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ShootDefaultArgs<ExtArgs>>): Prisma__ShootClient<$Result.GetResult<Prisma.$ShootPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    photos<T extends Gallery$photosArgs<ExtArgs> = {}>(args?: Subset<T, Gallery$photosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GalleryPhotoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Gallery model
   */
  interface GalleryFieldRefs {
    readonly id: FieldRef<"Gallery", 'String'>
    readonly tenantId: FieldRef<"Gallery", 'String'>
    readonly shootId: FieldRef<"Gallery", 'String'>
    readonly name: FieldRef<"Gallery", 'String'>
    readonly status: FieldRef<"Gallery", 'GalleryStatus'>
    readonly totalPhotos: FieldRef<"Gallery", 'Int'>
    readonly selectedPhotos: FieldRef<"Gallery", 'Int'>
    readonly aiCurated: FieldRef<"Gallery", 'Boolean'>
    readonly curationData: FieldRef<"Gallery", 'Json'>
    readonly publicUrl: FieldRef<"Gallery", 'String'>
    readonly password: FieldRef<"Gallery", 'String'>
    readonly expiresAt: FieldRef<"Gallery", 'DateTime'>
    readonly downloadEnabled: FieldRef<"Gallery", 'Boolean'>
    readonly createdAt: FieldRef<"Gallery", 'DateTime'>
    readonly updatedAt: FieldRef<"Gallery", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Gallery findUnique
   */
  export type GalleryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Gallery
     */
    select?: GallerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Gallery
     */
    omit?: GalleryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryInclude<ExtArgs> | null
    /**
     * Filter, which Gallery to fetch.
     */
    where: GalleryWhereUniqueInput
  }

  /**
   * Gallery findUniqueOrThrow
   */
  export type GalleryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Gallery
     */
    select?: GallerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Gallery
     */
    omit?: GalleryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryInclude<ExtArgs> | null
    /**
     * Filter, which Gallery to fetch.
     */
    where: GalleryWhereUniqueInput
  }

  /**
   * Gallery findFirst
   */
  export type GalleryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Gallery
     */
    select?: GallerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Gallery
     */
    omit?: GalleryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryInclude<ExtArgs> | null
    /**
     * Filter, which Gallery to fetch.
     */
    where?: GalleryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Galleries to fetch.
     */
    orderBy?: GalleryOrderByWithRelationInput | GalleryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Galleries.
     */
    cursor?: GalleryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Galleries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Galleries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Galleries.
     */
    distinct?: GalleryScalarFieldEnum | GalleryScalarFieldEnum[]
  }

  /**
   * Gallery findFirstOrThrow
   */
  export type GalleryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Gallery
     */
    select?: GallerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Gallery
     */
    omit?: GalleryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryInclude<ExtArgs> | null
    /**
     * Filter, which Gallery to fetch.
     */
    where?: GalleryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Galleries to fetch.
     */
    orderBy?: GalleryOrderByWithRelationInput | GalleryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Galleries.
     */
    cursor?: GalleryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Galleries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Galleries.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Galleries.
     */
    distinct?: GalleryScalarFieldEnum | GalleryScalarFieldEnum[]
  }

  /**
   * Gallery findMany
   */
  export type GalleryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Gallery
     */
    select?: GallerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Gallery
     */
    omit?: GalleryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryInclude<ExtArgs> | null
    /**
     * Filter, which Galleries to fetch.
     */
    where?: GalleryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Galleries to fetch.
     */
    orderBy?: GalleryOrderByWithRelationInput | GalleryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Galleries.
     */
    cursor?: GalleryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Galleries from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Galleries.
     */
    skip?: number
    distinct?: GalleryScalarFieldEnum | GalleryScalarFieldEnum[]
  }

  /**
   * Gallery create
   */
  export type GalleryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Gallery
     */
    select?: GallerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Gallery
     */
    omit?: GalleryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryInclude<ExtArgs> | null
    /**
     * The data needed to create a Gallery.
     */
    data: XOR<GalleryCreateInput, GalleryUncheckedCreateInput>
  }

  /**
   * Gallery createMany
   */
  export type GalleryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Galleries.
     */
    data: GalleryCreateManyInput | GalleryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Gallery createManyAndReturn
   */
  export type GalleryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Gallery
     */
    select?: GallerySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Gallery
     */
    omit?: GalleryOmit<ExtArgs> | null
    /**
     * The data used to create many Galleries.
     */
    data: GalleryCreateManyInput | GalleryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Gallery update
   */
  export type GalleryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Gallery
     */
    select?: GallerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Gallery
     */
    omit?: GalleryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryInclude<ExtArgs> | null
    /**
     * The data needed to update a Gallery.
     */
    data: XOR<GalleryUpdateInput, GalleryUncheckedUpdateInput>
    /**
     * Choose, which Gallery to update.
     */
    where: GalleryWhereUniqueInput
  }

  /**
   * Gallery updateMany
   */
  export type GalleryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Galleries.
     */
    data: XOR<GalleryUpdateManyMutationInput, GalleryUncheckedUpdateManyInput>
    /**
     * Filter which Galleries to update
     */
    where?: GalleryWhereInput
    /**
     * Limit how many Galleries to update.
     */
    limit?: number
  }

  /**
   * Gallery updateManyAndReturn
   */
  export type GalleryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Gallery
     */
    select?: GallerySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Gallery
     */
    omit?: GalleryOmit<ExtArgs> | null
    /**
     * The data used to update Galleries.
     */
    data: XOR<GalleryUpdateManyMutationInput, GalleryUncheckedUpdateManyInput>
    /**
     * Filter which Galleries to update
     */
    where?: GalleryWhereInput
    /**
     * Limit how many Galleries to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Gallery upsert
   */
  export type GalleryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Gallery
     */
    select?: GallerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Gallery
     */
    omit?: GalleryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryInclude<ExtArgs> | null
    /**
     * The filter to search for the Gallery to update in case it exists.
     */
    where: GalleryWhereUniqueInput
    /**
     * In case the Gallery found by the `where` argument doesn't exist, create a new Gallery with this data.
     */
    create: XOR<GalleryCreateInput, GalleryUncheckedCreateInput>
    /**
     * In case the Gallery was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GalleryUpdateInput, GalleryUncheckedUpdateInput>
  }

  /**
   * Gallery delete
   */
  export type GalleryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Gallery
     */
    select?: GallerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Gallery
     */
    omit?: GalleryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryInclude<ExtArgs> | null
    /**
     * Filter which Gallery to delete.
     */
    where: GalleryWhereUniqueInput
  }

  /**
   * Gallery deleteMany
   */
  export type GalleryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Galleries to delete
     */
    where?: GalleryWhereInput
    /**
     * Limit how many Galleries to delete.
     */
    limit?: number
  }

  /**
   * Gallery.photos
   */
  export type Gallery$photosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GalleryPhoto
     */
    select?: GalleryPhotoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GalleryPhoto
     */
    omit?: GalleryPhotoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryPhotoInclude<ExtArgs> | null
    where?: GalleryPhotoWhereInput
    orderBy?: GalleryPhotoOrderByWithRelationInput | GalleryPhotoOrderByWithRelationInput[]
    cursor?: GalleryPhotoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GalleryPhotoScalarFieldEnum | GalleryPhotoScalarFieldEnum[]
  }

  /**
   * Gallery without action
   */
  export type GalleryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Gallery
     */
    select?: GallerySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Gallery
     */
    omit?: GalleryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryInclude<ExtArgs> | null
  }


  /**
   * Model GalleryPhoto
   */

  export type AggregateGalleryPhoto = {
    _count: GalleryPhotoCountAggregateOutputType | null
    _avg: GalleryPhotoAvgAggregateOutputType | null
    _sum: GalleryPhotoSumAggregateOutputType | null
    _min: GalleryPhotoMinAggregateOutputType | null
    _max: GalleryPhotoMaxAggregateOutputType | null
  }

  export type GalleryPhotoAvgAggregateOutputType = {
    qualityScore: number | null
    emotionalImpact: number | null
  }

  export type GalleryPhotoSumAggregateOutputType = {
    qualityScore: number | null
    emotionalImpact: number | null
  }

  export type GalleryPhotoMinAggregateOutputType = {
    id: string | null
    galleryId: string | null
    filename: string | null
    url: string | null
    thumbnailUrl: string | null
    qualityScore: number | null
    category: string | null
    isHighlight: boolean | null
    aiReasoning: string | null
    emotionalImpact: number | null
    takenAt: Date | null
    camera: string | null
    lens: string | null
    selected: boolean | null
    rejected: boolean | null
    rejectionReason: string | null
    createdAt: Date | null
  }

  export type GalleryPhotoMaxAggregateOutputType = {
    id: string | null
    galleryId: string | null
    filename: string | null
    url: string | null
    thumbnailUrl: string | null
    qualityScore: number | null
    category: string | null
    isHighlight: boolean | null
    aiReasoning: string | null
    emotionalImpact: number | null
    takenAt: Date | null
    camera: string | null
    lens: string | null
    selected: boolean | null
    rejected: boolean | null
    rejectionReason: string | null
    createdAt: Date | null
  }

  export type GalleryPhotoCountAggregateOutputType = {
    id: number
    galleryId: number
    filename: number
    url: number
    thumbnailUrl: number
    qualityScore: number
    category: number
    isHighlight: number
    aiReasoning: number
    technicalQuality: number
    emotionalImpact: number
    takenAt: number
    camera: number
    lens: number
    settings: number
    selected: number
    rejected: number
    rejectionReason: number
    createdAt: number
    _all: number
  }


  export type GalleryPhotoAvgAggregateInputType = {
    qualityScore?: true
    emotionalImpact?: true
  }

  export type GalleryPhotoSumAggregateInputType = {
    qualityScore?: true
    emotionalImpact?: true
  }

  export type GalleryPhotoMinAggregateInputType = {
    id?: true
    galleryId?: true
    filename?: true
    url?: true
    thumbnailUrl?: true
    qualityScore?: true
    category?: true
    isHighlight?: true
    aiReasoning?: true
    emotionalImpact?: true
    takenAt?: true
    camera?: true
    lens?: true
    selected?: true
    rejected?: true
    rejectionReason?: true
    createdAt?: true
  }

  export type GalleryPhotoMaxAggregateInputType = {
    id?: true
    galleryId?: true
    filename?: true
    url?: true
    thumbnailUrl?: true
    qualityScore?: true
    category?: true
    isHighlight?: true
    aiReasoning?: true
    emotionalImpact?: true
    takenAt?: true
    camera?: true
    lens?: true
    selected?: true
    rejected?: true
    rejectionReason?: true
    createdAt?: true
  }

  export type GalleryPhotoCountAggregateInputType = {
    id?: true
    galleryId?: true
    filename?: true
    url?: true
    thumbnailUrl?: true
    qualityScore?: true
    category?: true
    isHighlight?: true
    aiReasoning?: true
    technicalQuality?: true
    emotionalImpact?: true
    takenAt?: true
    camera?: true
    lens?: true
    settings?: true
    selected?: true
    rejected?: true
    rejectionReason?: true
    createdAt?: true
    _all?: true
  }

  export type GalleryPhotoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GalleryPhoto to aggregate.
     */
    where?: GalleryPhotoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GalleryPhotos to fetch.
     */
    orderBy?: GalleryPhotoOrderByWithRelationInput | GalleryPhotoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GalleryPhotoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GalleryPhotos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GalleryPhotos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GalleryPhotos
    **/
    _count?: true | GalleryPhotoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GalleryPhotoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GalleryPhotoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GalleryPhotoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GalleryPhotoMaxAggregateInputType
  }

  export type GetGalleryPhotoAggregateType<T extends GalleryPhotoAggregateArgs> = {
        [P in keyof T & keyof AggregateGalleryPhoto]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGalleryPhoto[P]>
      : GetScalarType<T[P], AggregateGalleryPhoto[P]>
  }




  export type GalleryPhotoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GalleryPhotoWhereInput
    orderBy?: GalleryPhotoOrderByWithAggregationInput | GalleryPhotoOrderByWithAggregationInput[]
    by: GalleryPhotoScalarFieldEnum[] | GalleryPhotoScalarFieldEnum
    having?: GalleryPhotoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GalleryPhotoCountAggregateInputType | true
    _avg?: GalleryPhotoAvgAggregateInputType
    _sum?: GalleryPhotoSumAggregateInputType
    _min?: GalleryPhotoMinAggregateInputType
    _max?: GalleryPhotoMaxAggregateInputType
  }

  export type GalleryPhotoGroupByOutputType = {
    id: string
    galleryId: string
    filename: string
    url: string
    thumbnailUrl: string | null
    qualityScore: number | null
    category: string | null
    isHighlight: boolean
    aiReasoning: string | null
    technicalQuality: JsonValue | null
    emotionalImpact: number | null
    takenAt: Date | null
    camera: string | null
    lens: string | null
    settings: JsonValue | null
    selected: boolean
    rejected: boolean
    rejectionReason: string | null
    createdAt: Date
    _count: GalleryPhotoCountAggregateOutputType | null
    _avg: GalleryPhotoAvgAggregateOutputType | null
    _sum: GalleryPhotoSumAggregateOutputType | null
    _min: GalleryPhotoMinAggregateOutputType | null
    _max: GalleryPhotoMaxAggregateOutputType | null
  }

  type GetGalleryPhotoGroupByPayload<T extends GalleryPhotoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GalleryPhotoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GalleryPhotoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GalleryPhotoGroupByOutputType[P]>
            : GetScalarType<T[P], GalleryPhotoGroupByOutputType[P]>
        }
      >
    >


  export type GalleryPhotoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    galleryId?: boolean
    filename?: boolean
    url?: boolean
    thumbnailUrl?: boolean
    qualityScore?: boolean
    category?: boolean
    isHighlight?: boolean
    aiReasoning?: boolean
    technicalQuality?: boolean
    emotionalImpact?: boolean
    takenAt?: boolean
    camera?: boolean
    lens?: boolean
    settings?: boolean
    selected?: boolean
    rejected?: boolean
    rejectionReason?: boolean
    createdAt?: boolean
    gallery?: boolean | GalleryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["galleryPhoto"]>

  export type GalleryPhotoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    galleryId?: boolean
    filename?: boolean
    url?: boolean
    thumbnailUrl?: boolean
    qualityScore?: boolean
    category?: boolean
    isHighlight?: boolean
    aiReasoning?: boolean
    technicalQuality?: boolean
    emotionalImpact?: boolean
    takenAt?: boolean
    camera?: boolean
    lens?: boolean
    settings?: boolean
    selected?: boolean
    rejected?: boolean
    rejectionReason?: boolean
    createdAt?: boolean
    gallery?: boolean | GalleryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["galleryPhoto"]>

  export type GalleryPhotoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    galleryId?: boolean
    filename?: boolean
    url?: boolean
    thumbnailUrl?: boolean
    qualityScore?: boolean
    category?: boolean
    isHighlight?: boolean
    aiReasoning?: boolean
    technicalQuality?: boolean
    emotionalImpact?: boolean
    takenAt?: boolean
    camera?: boolean
    lens?: boolean
    settings?: boolean
    selected?: boolean
    rejected?: boolean
    rejectionReason?: boolean
    createdAt?: boolean
    gallery?: boolean | GalleryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["galleryPhoto"]>

  export type GalleryPhotoSelectScalar = {
    id?: boolean
    galleryId?: boolean
    filename?: boolean
    url?: boolean
    thumbnailUrl?: boolean
    qualityScore?: boolean
    category?: boolean
    isHighlight?: boolean
    aiReasoning?: boolean
    technicalQuality?: boolean
    emotionalImpact?: boolean
    takenAt?: boolean
    camera?: boolean
    lens?: boolean
    settings?: boolean
    selected?: boolean
    rejected?: boolean
    rejectionReason?: boolean
    createdAt?: boolean
  }

  export type GalleryPhotoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "galleryId" | "filename" | "url" | "thumbnailUrl" | "qualityScore" | "category" | "isHighlight" | "aiReasoning" | "technicalQuality" | "emotionalImpact" | "takenAt" | "camera" | "lens" | "settings" | "selected" | "rejected" | "rejectionReason" | "createdAt", ExtArgs["result"]["galleryPhoto"]>
  export type GalleryPhotoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gallery?: boolean | GalleryDefaultArgs<ExtArgs>
  }
  export type GalleryPhotoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gallery?: boolean | GalleryDefaultArgs<ExtArgs>
  }
  export type GalleryPhotoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gallery?: boolean | GalleryDefaultArgs<ExtArgs>
  }

  export type $GalleryPhotoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GalleryPhoto"
    objects: {
      gallery: Prisma.$GalleryPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      galleryId: string
      filename: string
      url: string
      thumbnailUrl: string | null
      qualityScore: number | null
      category: string | null
      isHighlight: boolean
      aiReasoning: string | null
      technicalQuality: Prisma.JsonValue | null
      emotionalImpact: number | null
      takenAt: Date | null
      camera: string | null
      lens: string | null
      settings: Prisma.JsonValue | null
      selected: boolean
      rejected: boolean
      rejectionReason: string | null
      createdAt: Date
    }, ExtArgs["result"]["galleryPhoto"]>
    composites: {}
  }

  type GalleryPhotoGetPayload<S extends boolean | null | undefined | GalleryPhotoDefaultArgs> = $Result.GetResult<Prisma.$GalleryPhotoPayload, S>

  type GalleryPhotoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<GalleryPhotoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: GalleryPhotoCountAggregateInputType | true
    }

  export interface GalleryPhotoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GalleryPhoto'], meta: { name: 'GalleryPhoto' } }
    /**
     * Find zero or one GalleryPhoto that matches the filter.
     * @param {GalleryPhotoFindUniqueArgs} args - Arguments to find a GalleryPhoto
     * @example
     * // Get one GalleryPhoto
     * const galleryPhoto = await prisma.galleryPhoto.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GalleryPhotoFindUniqueArgs>(args: SelectSubset<T, GalleryPhotoFindUniqueArgs<ExtArgs>>): Prisma__GalleryPhotoClient<$Result.GetResult<Prisma.$GalleryPhotoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one GalleryPhoto that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {GalleryPhotoFindUniqueOrThrowArgs} args - Arguments to find a GalleryPhoto
     * @example
     * // Get one GalleryPhoto
     * const galleryPhoto = await prisma.galleryPhoto.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GalleryPhotoFindUniqueOrThrowArgs>(args: SelectSubset<T, GalleryPhotoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GalleryPhotoClient<$Result.GetResult<Prisma.$GalleryPhotoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GalleryPhoto that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GalleryPhotoFindFirstArgs} args - Arguments to find a GalleryPhoto
     * @example
     * // Get one GalleryPhoto
     * const galleryPhoto = await prisma.galleryPhoto.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GalleryPhotoFindFirstArgs>(args?: SelectSubset<T, GalleryPhotoFindFirstArgs<ExtArgs>>): Prisma__GalleryPhotoClient<$Result.GetResult<Prisma.$GalleryPhotoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first GalleryPhoto that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GalleryPhotoFindFirstOrThrowArgs} args - Arguments to find a GalleryPhoto
     * @example
     * // Get one GalleryPhoto
     * const galleryPhoto = await prisma.galleryPhoto.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GalleryPhotoFindFirstOrThrowArgs>(args?: SelectSubset<T, GalleryPhotoFindFirstOrThrowArgs<ExtArgs>>): Prisma__GalleryPhotoClient<$Result.GetResult<Prisma.$GalleryPhotoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more GalleryPhotos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GalleryPhotoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GalleryPhotos
     * const galleryPhotos = await prisma.galleryPhoto.findMany()
     * 
     * // Get first 10 GalleryPhotos
     * const galleryPhotos = await prisma.galleryPhoto.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const galleryPhotoWithIdOnly = await prisma.galleryPhoto.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GalleryPhotoFindManyArgs>(args?: SelectSubset<T, GalleryPhotoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GalleryPhotoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a GalleryPhoto.
     * @param {GalleryPhotoCreateArgs} args - Arguments to create a GalleryPhoto.
     * @example
     * // Create one GalleryPhoto
     * const GalleryPhoto = await prisma.galleryPhoto.create({
     *   data: {
     *     // ... data to create a GalleryPhoto
     *   }
     * })
     * 
     */
    create<T extends GalleryPhotoCreateArgs>(args: SelectSubset<T, GalleryPhotoCreateArgs<ExtArgs>>): Prisma__GalleryPhotoClient<$Result.GetResult<Prisma.$GalleryPhotoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many GalleryPhotos.
     * @param {GalleryPhotoCreateManyArgs} args - Arguments to create many GalleryPhotos.
     * @example
     * // Create many GalleryPhotos
     * const galleryPhoto = await prisma.galleryPhoto.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GalleryPhotoCreateManyArgs>(args?: SelectSubset<T, GalleryPhotoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GalleryPhotos and returns the data saved in the database.
     * @param {GalleryPhotoCreateManyAndReturnArgs} args - Arguments to create many GalleryPhotos.
     * @example
     * // Create many GalleryPhotos
     * const galleryPhoto = await prisma.galleryPhoto.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GalleryPhotos and only return the `id`
     * const galleryPhotoWithIdOnly = await prisma.galleryPhoto.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GalleryPhotoCreateManyAndReturnArgs>(args?: SelectSubset<T, GalleryPhotoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GalleryPhotoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a GalleryPhoto.
     * @param {GalleryPhotoDeleteArgs} args - Arguments to delete one GalleryPhoto.
     * @example
     * // Delete one GalleryPhoto
     * const GalleryPhoto = await prisma.galleryPhoto.delete({
     *   where: {
     *     // ... filter to delete one GalleryPhoto
     *   }
     * })
     * 
     */
    delete<T extends GalleryPhotoDeleteArgs>(args: SelectSubset<T, GalleryPhotoDeleteArgs<ExtArgs>>): Prisma__GalleryPhotoClient<$Result.GetResult<Prisma.$GalleryPhotoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one GalleryPhoto.
     * @param {GalleryPhotoUpdateArgs} args - Arguments to update one GalleryPhoto.
     * @example
     * // Update one GalleryPhoto
     * const galleryPhoto = await prisma.galleryPhoto.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GalleryPhotoUpdateArgs>(args: SelectSubset<T, GalleryPhotoUpdateArgs<ExtArgs>>): Prisma__GalleryPhotoClient<$Result.GetResult<Prisma.$GalleryPhotoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more GalleryPhotos.
     * @param {GalleryPhotoDeleteManyArgs} args - Arguments to filter GalleryPhotos to delete.
     * @example
     * // Delete a few GalleryPhotos
     * const { count } = await prisma.galleryPhoto.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GalleryPhotoDeleteManyArgs>(args?: SelectSubset<T, GalleryPhotoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GalleryPhotos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GalleryPhotoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GalleryPhotos
     * const galleryPhoto = await prisma.galleryPhoto.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GalleryPhotoUpdateManyArgs>(args: SelectSubset<T, GalleryPhotoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GalleryPhotos and returns the data updated in the database.
     * @param {GalleryPhotoUpdateManyAndReturnArgs} args - Arguments to update many GalleryPhotos.
     * @example
     * // Update many GalleryPhotos
     * const galleryPhoto = await prisma.galleryPhoto.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more GalleryPhotos and only return the `id`
     * const galleryPhotoWithIdOnly = await prisma.galleryPhoto.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends GalleryPhotoUpdateManyAndReturnArgs>(args: SelectSubset<T, GalleryPhotoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GalleryPhotoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one GalleryPhoto.
     * @param {GalleryPhotoUpsertArgs} args - Arguments to update or create a GalleryPhoto.
     * @example
     * // Update or create a GalleryPhoto
     * const galleryPhoto = await prisma.galleryPhoto.upsert({
     *   create: {
     *     // ... data to create a GalleryPhoto
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GalleryPhoto we want to update
     *   }
     * })
     */
    upsert<T extends GalleryPhotoUpsertArgs>(args: SelectSubset<T, GalleryPhotoUpsertArgs<ExtArgs>>): Prisma__GalleryPhotoClient<$Result.GetResult<Prisma.$GalleryPhotoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of GalleryPhotos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GalleryPhotoCountArgs} args - Arguments to filter GalleryPhotos to count.
     * @example
     * // Count the number of GalleryPhotos
     * const count = await prisma.galleryPhoto.count({
     *   where: {
     *     // ... the filter for the GalleryPhotos we want to count
     *   }
     * })
    **/
    count<T extends GalleryPhotoCountArgs>(
      args?: Subset<T, GalleryPhotoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GalleryPhotoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GalleryPhoto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GalleryPhotoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GalleryPhotoAggregateArgs>(args: Subset<T, GalleryPhotoAggregateArgs>): Prisma.PrismaPromise<GetGalleryPhotoAggregateType<T>>

    /**
     * Group by GalleryPhoto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GalleryPhotoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GalleryPhotoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GalleryPhotoGroupByArgs['orderBy'] }
        : { orderBy?: GalleryPhotoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GalleryPhotoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGalleryPhotoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GalleryPhoto model
   */
  readonly fields: GalleryPhotoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GalleryPhoto.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GalleryPhotoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    gallery<T extends GalleryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, GalleryDefaultArgs<ExtArgs>>): Prisma__GalleryClient<$Result.GetResult<Prisma.$GalleryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GalleryPhoto model
   */
  interface GalleryPhotoFieldRefs {
    readonly id: FieldRef<"GalleryPhoto", 'String'>
    readonly galleryId: FieldRef<"GalleryPhoto", 'String'>
    readonly filename: FieldRef<"GalleryPhoto", 'String'>
    readonly url: FieldRef<"GalleryPhoto", 'String'>
    readonly thumbnailUrl: FieldRef<"GalleryPhoto", 'String'>
    readonly qualityScore: FieldRef<"GalleryPhoto", 'Float'>
    readonly category: FieldRef<"GalleryPhoto", 'String'>
    readonly isHighlight: FieldRef<"GalleryPhoto", 'Boolean'>
    readonly aiReasoning: FieldRef<"GalleryPhoto", 'String'>
    readonly technicalQuality: FieldRef<"GalleryPhoto", 'Json'>
    readonly emotionalImpact: FieldRef<"GalleryPhoto", 'Float'>
    readonly takenAt: FieldRef<"GalleryPhoto", 'DateTime'>
    readonly camera: FieldRef<"GalleryPhoto", 'String'>
    readonly lens: FieldRef<"GalleryPhoto", 'String'>
    readonly settings: FieldRef<"GalleryPhoto", 'Json'>
    readonly selected: FieldRef<"GalleryPhoto", 'Boolean'>
    readonly rejected: FieldRef<"GalleryPhoto", 'Boolean'>
    readonly rejectionReason: FieldRef<"GalleryPhoto", 'String'>
    readonly createdAt: FieldRef<"GalleryPhoto", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GalleryPhoto findUnique
   */
  export type GalleryPhotoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GalleryPhoto
     */
    select?: GalleryPhotoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GalleryPhoto
     */
    omit?: GalleryPhotoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryPhotoInclude<ExtArgs> | null
    /**
     * Filter, which GalleryPhoto to fetch.
     */
    where: GalleryPhotoWhereUniqueInput
  }

  /**
   * GalleryPhoto findUniqueOrThrow
   */
  export type GalleryPhotoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GalleryPhoto
     */
    select?: GalleryPhotoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GalleryPhoto
     */
    omit?: GalleryPhotoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryPhotoInclude<ExtArgs> | null
    /**
     * Filter, which GalleryPhoto to fetch.
     */
    where: GalleryPhotoWhereUniqueInput
  }

  /**
   * GalleryPhoto findFirst
   */
  export type GalleryPhotoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GalleryPhoto
     */
    select?: GalleryPhotoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GalleryPhoto
     */
    omit?: GalleryPhotoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryPhotoInclude<ExtArgs> | null
    /**
     * Filter, which GalleryPhoto to fetch.
     */
    where?: GalleryPhotoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GalleryPhotos to fetch.
     */
    orderBy?: GalleryPhotoOrderByWithRelationInput | GalleryPhotoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GalleryPhotos.
     */
    cursor?: GalleryPhotoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GalleryPhotos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GalleryPhotos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GalleryPhotos.
     */
    distinct?: GalleryPhotoScalarFieldEnum | GalleryPhotoScalarFieldEnum[]
  }

  /**
   * GalleryPhoto findFirstOrThrow
   */
  export type GalleryPhotoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GalleryPhoto
     */
    select?: GalleryPhotoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GalleryPhoto
     */
    omit?: GalleryPhotoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryPhotoInclude<ExtArgs> | null
    /**
     * Filter, which GalleryPhoto to fetch.
     */
    where?: GalleryPhotoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GalleryPhotos to fetch.
     */
    orderBy?: GalleryPhotoOrderByWithRelationInput | GalleryPhotoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GalleryPhotos.
     */
    cursor?: GalleryPhotoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GalleryPhotos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GalleryPhotos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GalleryPhotos.
     */
    distinct?: GalleryPhotoScalarFieldEnum | GalleryPhotoScalarFieldEnum[]
  }

  /**
   * GalleryPhoto findMany
   */
  export type GalleryPhotoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GalleryPhoto
     */
    select?: GalleryPhotoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GalleryPhoto
     */
    omit?: GalleryPhotoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryPhotoInclude<ExtArgs> | null
    /**
     * Filter, which GalleryPhotos to fetch.
     */
    where?: GalleryPhotoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GalleryPhotos to fetch.
     */
    orderBy?: GalleryPhotoOrderByWithRelationInput | GalleryPhotoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GalleryPhotos.
     */
    cursor?: GalleryPhotoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GalleryPhotos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GalleryPhotos.
     */
    skip?: number
    distinct?: GalleryPhotoScalarFieldEnum | GalleryPhotoScalarFieldEnum[]
  }

  /**
   * GalleryPhoto create
   */
  export type GalleryPhotoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GalleryPhoto
     */
    select?: GalleryPhotoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GalleryPhoto
     */
    omit?: GalleryPhotoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryPhotoInclude<ExtArgs> | null
    /**
     * The data needed to create a GalleryPhoto.
     */
    data: XOR<GalleryPhotoCreateInput, GalleryPhotoUncheckedCreateInput>
  }

  /**
   * GalleryPhoto createMany
   */
  export type GalleryPhotoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GalleryPhotos.
     */
    data: GalleryPhotoCreateManyInput | GalleryPhotoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GalleryPhoto createManyAndReturn
   */
  export type GalleryPhotoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GalleryPhoto
     */
    select?: GalleryPhotoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GalleryPhoto
     */
    omit?: GalleryPhotoOmit<ExtArgs> | null
    /**
     * The data used to create many GalleryPhotos.
     */
    data: GalleryPhotoCreateManyInput | GalleryPhotoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryPhotoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * GalleryPhoto update
   */
  export type GalleryPhotoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GalleryPhoto
     */
    select?: GalleryPhotoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GalleryPhoto
     */
    omit?: GalleryPhotoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryPhotoInclude<ExtArgs> | null
    /**
     * The data needed to update a GalleryPhoto.
     */
    data: XOR<GalleryPhotoUpdateInput, GalleryPhotoUncheckedUpdateInput>
    /**
     * Choose, which GalleryPhoto to update.
     */
    where: GalleryPhotoWhereUniqueInput
  }

  /**
   * GalleryPhoto updateMany
   */
  export type GalleryPhotoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GalleryPhotos.
     */
    data: XOR<GalleryPhotoUpdateManyMutationInput, GalleryPhotoUncheckedUpdateManyInput>
    /**
     * Filter which GalleryPhotos to update
     */
    where?: GalleryPhotoWhereInput
    /**
     * Limit how many GalleryPhotos to update.
     */
    limit?: number
  }

  /**
   * GalleryPhoto updateManyAndReturn
   */
  export type GalleryPhotoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GalleryPhoto
     */
    select?: GalleryPhotoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the GalleryPhoto
     */
    omit?: GalleryPhotoOmit<ExtArgs> | null
    /**
     * The data used to update GalleryPhotos.
     */
    data: XOR<GalleryPhotoUpdateManyMutationInput, GalleryPhotoUncheckedUpdateManyInput>
    /**
     * Filter which GalleryPhotos to update
     */
    where?: GalleryPhotoWhereInput
    /**
     * Limit how many GalleryPhotos to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryPhotoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * GalleryPhoto upsert
   */
  export type GalleryPhotoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GalleryPhoto
     */
    select?: GalleryPhotoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GalleryPhoto
     */
    omit?: GalleryPhotoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryPhotoInclude<ExtArgs> | null
    /**
     * The filter to search for the GalleryPhoto to update in case it exists.
     */
    where: GalleryPhotoWhereUniqueInput
    /**
     * In case the GalleryPhoto found by the `where` argument doesn't exist, create a new GalleryPhoto with this data.
     */
    create: XOR<GalleryPhotoCreateInput, GalleryPhotoUncheckedCreateInput>
    /**
     * In case the GalleryPhoto was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GalleryPhotoUpdateInput, GalleryPhotoUncheckedUpdateInput>
  }

  /**
   * GalleryPhoto delete
   */
  export type GalleryPhotoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GalleryPhoto
     */
    select?: GalleryPhotoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GalleryPhoto
     */
    omit?: GalleryPhotoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryPhotoInclude<ExtArgs> | null
    /**
     * Filter which GalleryPhoto to delete.
     */
    where: GalleryPhotoWhereUniqueInput
  }

  /**
   * GalleryPhoto deleteMany
   */
  export type GalleryPhotoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GalleryPhotos to delete
     */
    where?: GalleryPhotoWhereInput
    /**
     * Limit how many GalleryPhotos to delete.
     */
    limit?: number
  }

  /**
   * GalleryPhoto without action
   */
  export type GalleryPhotoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GalleryPhoto
     */
    select?: GalleryPhotoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the GalleryPhoto
     */
    omit?: GalleryPhotoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GalleryPhotoInclude<ExtArgs> | null
  }


  /**
   * Model Invoice
   */

  export type AggregateInvoice = {
    _count: InvoiceCountAggregateOutputType | null
    _avg: InvoiceAvgAggregateOutputType | null
    _sum: InvoiceSumAggregateOutputType | null
    _min: InvoiceMinAggregateOutputType | null
    _max: InvoiceMaxAggregateOutputType | null
  }

  export type InvoiceAvgAggregateOutputType = {
    subtotal: number | null
    tax: number | null
    total: number | null
  }

  export type InvoiceSumAggregateOutputType = {
    subtotal: number | null
    tax: number | null
    total: number | null
  }

  export type InvoiceMinAggregateOutputType = {
    id: string | null
    tenantId: string | null
    clientId: string | null
    packageId: string | null
    invoiceNumber: string | null
    status: $Enums.InvoiceStatus | null
    subtotal: number | null
    tax: number | null
    total: number | null
    dueDate: Date | null
    paidAt: Date | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InvoiceMaxAggregateOutputType = {
    id: string | null
    tenantId: string | null
    clientId: string | null
    packageId: string | null
    invoiceNumber: string | null
    status: $Enums.InvoiceStatus | null
    subtotal: number | null
    tax: number | null
    total: number | null
    dueDate: Date | null
    paidAt: Date | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InvoiceCountAggregateOutputType = {
    id: number
    tenantId: number
    clientId: number
    packageId: number
    invoiceNumber: number
    status: number
    items: number
    subtotal: number
    tax: number
    total: number
    dueDate: number
    paidAt: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type InvoiceAvgAggregateInputType = {
    subtotal?: true
    tax?: true
    total?: true
  }

  export type InvoiceSumAggregateInputType = {
    subtotal?: true
    tax?: true
    total?: true
  }

  export type InvoiceMinAggregateInputType = {
    id?: true
    tenantId?: true
    clientId?: true
    packageId?: true
    invoiceNumber?: true
    status?: true
    subtotal?: true
    tax?: true
    total?: true
    dueDate?: true
    paidAt?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InvoiceMaxAggregateInputType = {
    id?: true
    tenantId?: true
    clientId?: true
    packageId?: true
    invoiceNumber?: true
    status?: true
    subtotal?: true
    tax?: true
    total?: true
    dueDate?: true
    paidAt?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InvoiceCountAggregateInputType = {
    id?: true
    tenantId?: true
    clientId?: true
    packageId?: true
    invoiceNumber?: true
    status?: true
    items?: true
    subtotal?: true
    tax?: true
    total?: true
    dueDate?: true
    paidAt?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type InvoiceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Invoice to aggregate.
     */
    where?: InvoiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Invoices to fetch.
     */
    orderBy?: InvoiceOrderByWithRelationInput | InvoiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InvoiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Invoices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Invoices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Invoices
    **/
    _count?: true | InvoiceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InvoiceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InvoiceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InvoiceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InvoiceMaxAggregateInputType
  }

  export type GetInvoiceAggregateType<T extends InvoiceAggregateArgs> = {
        [P in keyof T & keyof AggregateInvoice]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInvoice[P]>
      : GetScalarType<T[P], AggregateInvoice[P]>
  }




  export type InvoiceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InvoiceWhereInput
    orderBy?: InvoiceOrderByWithAggregationInput | InvoiceOrderByWithAggregationInput[]
    by: InvoiceScalarFieldEnum[] | InvoiceScalarFieldEnum
    having?: InvoiceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InvoiceCountAggregateInputType | true
    _avg?: InvoiceAvgAggregateInputType
    _sum?: InvoiceSumAggregateInputType
    _min?: InvoiceMinAggregateInputType
    _max?: InvoiceMaxAggregateInputType
  }

  export type InvoiceGroupByOutputType = {
    id: string
    tenantId: string
    clientId: string
    packageId: string | null
    invoiceNumber: string
    status: $Enums.InvoiceStatus
    items: JsonValue
    subtotal: number
    tax: number
    total: number
    dueDate: Date | null
    paidAt: Date | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: InvoiceCountAggregateOutputType | null
    _avg: InvoiceAvgAggregateOutputType | null
    _sum: InvoiceSumAggregateOutputType | null
    _min: InvoiceMinAggregateOutputType | null
    _max: InvoiceMaxAggregateOutputType | null
  }

  type GetInvoiceGroupByPayload<T extends InvoiceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InvoiceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InvoiceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InvoiceGroupByOutputType[P]>
            : GetScalarType<T[P], InvoiceGroupByOutputType[P]>
        }
      >
    >


  export type InvoiceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    clientId?: boolean
    packageId?: boolean
    invoiceNumber?: boolean
    status?: boolean
    items?: boolean
    subtotal?: boolean
    tax?: boolean
    total?: boolean
    dueDate?: boolean
    paidAt?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
    package?: boolean | Invoice$packageArgs<ExtArgs>
  }, ExtArgs["result"]["invoice"]>

  export type InvoiceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    clientId?: boolean
    packageId?: boolean
    invoiceNumber?: boolean
    status?: boolean
    items?: boolean
    subtotal?: boolean
    tax?: boolean
    total?: boolean
    dueDate?: boolean
    paidAt?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
    package?: boolean | Invoice$packageArgs<ExtArgs>
  }, ExtArgs["result"]["invoice"]>

  export type InvoiceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tenantId?: boolean
    clientId?: boolean
    packageId?: boolean
    invoiceNumber?: boolean
    status?: boolean
    items?: boolean
    subtotal?: boolean
    tax?: boolean
    total?: boolean
    dueDate?: boolean
    paidAt?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
    package?: boolean | Invoice$packageArgs<ExtArgs>
  }, ExtArgs["result"]["invoice"]>

  export type InvoiceSelectScalar = {
    id?: boolean
    tenantId?: boolean
    clientId?: boolean
    packageId?: boolean
    invoiceNumber?: boolean
    status?: boolean
    items?: boolean
    subtotal?: boolean
    tax?: boolean
    total?: boolean
    dueDate?: boolean
    paidAt?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type InvoiceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tenantId" | "clientId" | "packageId" | "invoiceNumber" | "status" | "items" | "subtotal" | "tax" | "total" | "dueDate" | "paidAt" | "notes" | "createdAt" | "updatedAt", ExtArgs["result"]["invoice"]>
  export type InvoiceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
    package?: boolean | Invoice$packageArgs<ExtArgs>
  }
  export type InvoiceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
    package?: boolean | Invoice$packageArgs<ExtArgs>
  }
  export type InvoiceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tenant?: boolean | TenantDefaultArgs<ExtArgs>
    client?: boolean | ClientDefaultArgs<ExtArgs>
    package?: boolean | Invoice$packageArgs<ExtArgs>
  }

  export type $InvoicePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Invoice"
    objects: {
      tenant: Prisma.$TenantPayload<ExtArgs>
      client: Prisma.$ClientPayload<ExtArgs>
      package: Prisma.$PackagePayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tenantId: string
      clientId: string
      packageId: string | null
      invoiceNumber: string
      status: $Enums.InvoiceStatus
      items: Prisma.JsonValue
      subtotal: number
      tax: number
      total: number
      dueDate: Date | null
      paidAt: Date | null
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["invoice"]>
    composites: {}
  }

  type InvoiceGetPayload<S extends boolean | null | undefined | InvoiceDefaultArgs> = $Result.GetResult<Prisma.$InvoicePayload, S>

  type InvoiceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InvoiceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InvoiceCountAggregateInputType | true
    }

  export interface InvoiceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Invoice'], meta: { name: 'Invoice' } }
    /**
     * Find zero or one Invoice that matches the filter.
     * @param {InvoiceFindUniqueArgs} args - Arguments to find a Invoice
     * @example
     * // Get one Invoice
     * const invoice = await prisma.invoice.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InvoiceFindUniqueArgs>(args: SelectSubset<T, InvoiceFindUniqueArgs<ExtArgs>>): Prisma__InvoiceClient<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Invoice that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InvoiceFindUniqueOrThrowArgs} args - Arguments to find a Invoice
     * @example
     * // Get one Invoice
     * const invoice = await prisma.invoice.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InvoiceFindUniqueOrThrowArgs>(args: SelectSubset<T, InvoiceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InvoiceClient<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Invoice that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvoiceFindFirstArgs} args - Arguments to find a Invoice
     * @example
     * // Get one Invoice
     * const invoice = await prisma.invoice.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InvoiceFindFirstArgs>(args?: SelectSubset<T, InvoiceFindFirstArgs<ExtArgs>>): Prisma__InvoiceClient<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Invoice that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvoiceFindFirstOrThrowArgs} args - Arguments to find a Invoice
     * @example
     * // Get one Invoice
     * const invoice = await prisma.invoice.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InvoiceFindFirstOrThrowArgs>(args?: SelectSubset<T, InvoiceFindFirstOrThrowArgs<ExtArgs>>): Prisma__InvoiceClient<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Invoices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvoiceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Invoices
     * const invoices = await prisma.invoice.findMany()
     * 
     * // Get first 10 Invoices
     * const invoices = await prisma.invoice.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const invoiceWithIdOnly = await prisma.invoice.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InvoiceFindManyArgs>(args?: SelectSubset<T, InvoiceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Invoice.
     * @param {InvoiceCreateArgs} args - Arguments to create a Invoice.
     * @example
     * // Create one Invoice
     * const Invoice = await prisma.invoice.create({
     *   data: {
     *     // ... data to create a Invoice
     *   }
     * })
     * 
     */
    create<T extends InvoiceCreateArgs>(args: SelectSubset<T, InvoiceCreateArgs<ExtArgs>>): Prisma__InvoiceClient<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Invoices.
     * @param {InvoiceCreateManyArgs} args - Arguments to create many Invoices.
     * @example
     * // Create many Invoices
     * const invoice = await prisma.invoice.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InvoiceCreateManyArgs>(args?: SelectSubset<T, InvoiceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Invoices and returns the data saved in the database.
     * @param {InvoiceCreateManyAndReturnArgs} args - Arguments to create many Invoices.
     * @example
     * // Create many Invoices
     * const invoice = await prisma.invoice.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Invoices and only return the `id`
     * const invoiceWithIdOnly = await prisma.invoice.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InvoiceCreateManyAndReturnArgs>(args?: SelectSubset<T, InvoiceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Invoice.
     * @param {InvoiceDeleteArgs} args - Arguments to delete one Invoice.
     * @example
     * // Delete one Invoice
     * const Invoice = await prisma.invoice.delete({
     *   where: {
     *     // ... filter to delete one Invoice
     *   }
     * })
     * 
     */
    delete<T extends InvoiceDeleteArgs>(args: SelectSubset<T, InvoiceDeleteArgs<ExtArgs>>): Prisma__InvoiceClient<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Invoice.
     * @param {InvoiceUpdateArgs} args - Arguments to update one Invoice.
     * @example
     * // Update one Invoice
     * const invoice = await prisma.invoice.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InvoiceUpdateArgs>(args: SelectSubset<T, InvoiceUpdateArgs<ExtArgs>>): Prisma__InvoiceClient<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Invoices.
     * @param {InvoiceDeleteManyArgs} args - Arguments to filter Invoices to delete.
     * @example
     * // Delete a few Invoices
     * const { count } = await prisma.invoice.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InvoiceDeleteManyArgs>(args?: SelectSubset<T, InvoiceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Invoices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvoiceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Invoices
     * const invoice = await prisma.invoice.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InvoiceUpdateManyArgs>(args: SelectSubset<T, InvoiceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Invoices and returns the data updated in the database.
     * @param {InvoiceUpdateManyAndReturnArgs} args - Arguments to update many Invoices.
     * @example
     * // Update many Invoices
     * const invoice = await prisma.invoice.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Invoices and only return the `id`
     * const invoiceWithIdOnly = await prisma.invoice.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends InvoiceUpdateManyAndReturnArgs>(args: SelectSubset<T, InvoiceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Invoice.
     * @param {InvoiceUpsertArgs} args - Arguments to update or create a Invoice.
     * @example
     * // Update or create a Invoice
     * const invoice = await prisma.invoice.upsert({
     *   create: {
     *     // ... data to create a Invoice
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Invoice we want to update
     *   }
     * })
     */
    upsert<T extends InvoiceUpsertArgs>(args: SelectSubset<T, InvoiceUpsertArgs<ExtArgs>>): Prisma__InvoiceClient<$Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Invoices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvoiceCountArgs} args - Arguments to filter Invoices to count.
     * @example
     * // Count the number of Invoices
     * const count = await prisma.invoice.count({
     *   where: {
     *     // ... the filter for the Invoices we want to count
     *   }
     * })
    **/
    count<T extends InvoiceCountArgs>(
      args?: Subset<T, InvoiceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InvoiceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Invoice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvoiceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InvoiceAggregateArgs>(args: Subset<T, InvoiceAggregateArgs>): Prisma.PrismaPromise<GetInvoiceAggregateType<T>>

    /**
     * Group by Invoice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InvoiceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InvoiceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InvoiceGroupByArgs['orderBy'] }
        : { orderBy?: InvoiceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InvoiceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInvoiceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Invoice model
   */
  readonly fields: InvoiceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Invoice.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InvoiceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    tenant<T extends TenantDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TenantDefaultArgs<ExtArgs>>): Prisma__TenantClient<$Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    client<T extends ClientDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClientDefaultArgs<ExtArgs>>): Prisma__ClientClient<$Result.GetResult<Prisma.$ClientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    package<T extends Invoice$packageArgs<ExtArgs> = {}>(args?: Subset<T, Invoice$packageArgs<ExtArgs>>): Prisma__PackageClient<$Result.GetResult<Prisma.$PackagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Invoice model
   */
  interface InvoiceFieldRefs {
    readonly id: FieldRef<"Invoice", 'String'>
    readonly tenantId: FieldRef<"Invoice", 'String'>
    readonly clientId: FieldRef<"Invoice", 'String'>
    readonly packageId: FieldRef<"Invoice", 'String'>
    readonly invoiceNumber: FieldRef<"Invoice", 'String'>
    readonly status: FieldRef<"Invoice", 'InvoiceStatus'>
    readonly items: FieldRef<"Invoice", 'Json'>
    readonly subtotal: FieldRef<"Invoice", 'Int'>
    readonly tax: FieldRef<"Invoice", 'Int'>
    readonly total: FieldRef<"Invoice", 'Int'>
    readonly dueDate: FieldRef<"Invoice", 'DateTime'>
    readonly paidAt: FieldRef<"Invoice", 'DateTime'>
    readonly notes: FieldRef<"Invoice", 'String'>
    readonly createdAt: FieldRef<"Invoice", 'DateTime'>
    readonly updatedAt: FieldRef<"Invoice", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Invoice findUnique
   */
  export type InvoiceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * Filter, which Invoice to fetch.
     */
    where: InvoiceWhereUniqueInput
  }

  /**
   * Invoice findUniqueOrThrow
   */
  export type InvoiceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * Filter, which Invoice to fetch.
     */
    where: InvoiceWhereUniqueInput
  }

  /**
   * Invoice findFirst
   */
  export type InvoiceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * Filter, which Invoice to fetch.
     */
    where?: InvoiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Invoices to fetch.
     */
    orderBy?: InvoiceOrderByWithRelationInput | InvoiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Invoices.
     */
    cursor?: InvoiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Invoices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Invoices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Invoices.
     */
    distinct?: InvoiceScalarFieldEnum | InvoiceScalarFieldEnum[]
  }

  /**
   * Invoice findFirstOrThrow
   */
  export type InvoiceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * Filter, which Invoice to fetch.
     */
    where?: InvoiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Invoices to fetch.
     */
    orderBy?: InvoiceOrderByWithRelationInput | InvoiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Invoices.
     */
    cursor?: InvoiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Invoices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Invoices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Invoices.
     */
    distinct?: InvoiceScalarFieldEnum | InvoiceScalarFieldEnum[]
  }

  /**
   * Invoice findMany
   */
  export type InvoiceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * Filter, which Invoices to fetch.
     */
    where?: InvoiceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Invoices to fetch.
     */
    orderBy?: InvoiceOrderByWithRelationInput | InvoiceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Invoices.
     */
    cursor?: InvoiceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Invoices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Invoices.
     */
    skip?: number
    distinct?: InvoiceScalarFieldEnum | InvoiceScalarFieldEnum[]
  }

  /**
   * Invoice create
   */
  export type InvoiceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * The data needed to create a Invoice.
     */
    data: XOR<InvoiceCreateInput, InvoiceUncheckedCreateInput>
  }

  /**
   * Invoice createMany
   */
  export type InvoiceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Invoices.
     */
    data: InvoiceCreateManyInput | InvoiceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Invoice createManyAndReturn
   */
  export type InvoiceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * The data used to create many Invoices.
     */
    data: InvoiceCreateManyInput | InvoiceCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Invoice update
   */
  export type InvoiceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * The data needed to update a Invoice.
     */
    data: XOR<InvoiceUpdateInput, InvoiceUncheckedUpdateInput>
    /**
     * Choose, which Invoice to update.
     */
    where: InvoiceWhereUniqueInput
  }

  /**
   * Invoice updateMany
   */
  export type InvoiceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Invoices.
     */
    data: XOR<InvoiceUpdateManyMutationInput, InvoiceUncheckedUpdateManyInput>
    /**
     * Filter which Invoices to update
     */
    where?: InvoiceWhereInput
    /**
     * Limit how many Invoices to update.
     */
    limit?: number
  }

  /**
   * Invoice updateManyAndReturn
   */
  export type InvoiceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * The data used to update Invoices.
     */
    data: XOR<InvoiceUpdateManyMutationInput, InvoiceUncheckedUpdateManyInput>
    /**
     * Filter which Invoices to update
     */
    where?: InvoiceWhereInput
    /**
     * Limit how many Invoices to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Invoice upsert
   */
  export type InvoiceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * The filter to search for the Invoice to update in case it exists.
     */
    where: InvoiceWhereUniqueInput
    /**
     * In case the Invoice found by the `where` argument doesn't exist, create a new Invoice with this data.
     */
    create: XOR<InvoiceCreateInput, InvoiceUncheckedCreateInput>
    /**
     * In case the Invoice was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InvoiceUpdateInput, InvoiceUncheckedUpdateInput>
  }

  /**
   * Invoice delete
   */
  export type InvoiceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
    /**
     * Filter which Invoice to delete.
     */
    where: InvoiceWhereUniqueInput
  }

  /**
   * Invoice deleteMany
   */
  export type InvoiceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Invoices to delete
     */
    where?: InvoiceWhereInput
    /**
     * Limit how many Invoices to delete.
     */
    limit?: number
  }

  /**
   * Invoice.package
   */
  export type Invoice$packageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Package
     */
    select?: PackageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Package
     */
    omit?: PackageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PackageInclude<ExtArgs> | null
    where?: PackageWhereInput
  }

  /**
   * Invoice without action
   */
  export type InvoiceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Invoice
     */
    select?: InvoiceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Invoice
     */
    omit?: InvoiceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InvoiceInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const TenantScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    plan: 'plan',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TenantScalarFieldEnum = (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    passwordHash: 'passwordHash',
    role: 'role',
    tenantId: 'tenantId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ClientScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    name: 'name',
    email: 'email',
    phone: 'phone',
    address: 'address',
    type: 'type',
    tags: 'tags',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ClientScalarFieldEnum = (typeof ClientScalarFieldEnum)[keyof typeof ClientScalarFieldEnum]


  export const PackageScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    clientId: 'clientId',
    title: 'title',
    status: 'status',
    eventType: 'eventType',
    eventDate: 'eventDate',
    shotCount: 'shotCount',
    deliveryDays: 'deliveryDays',
    galleryUrl: 'galleryUrl',
    editingHours: 'editingHours',
    styleTags: 'styleTags',
    equipment: 'equipment',
    secondShooter: 'secondShooter',
    rawFilesIncluded: 'rawFilesIncluded',
    timeline: 'timeline',
    basePrice: 'basePrice',
    travelCosts: 'travelCosts',
    totalPrice: 'totalPrice',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PackageScalarFieldEnum = (typeof PackageScalarFieldEnum)[keyof typeof PackageScalarFieldEnum]


  export const PackageAddonScalarFieldEnum: {
    id: 'id',
    packageId: 'packageId',
    name: 'name',
    description: 'description',
    price: 'price',
    quantity: 'quantity',
    createdAt: 'createdAt'
  };

  export type PackageAddonScalarFieldEnum = (typeof PackageAddonScalarFieldEnum)[keyof typeof PackageAddonScalarFieldEnum]


  export const ShootScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    packageId: 'packageId',
    date: 'date',
    startTime: 'startTime',
    endTime: 'endTime',
    shotListId: 'shotListId',
    timeline: 'timeline',
    locations: 'locations',
    sunsetTime: 'sunsetTime',
    weatherForecast: 'weatherForecast',
    venueType: 'venueType',
    venueName: 'venueName',
    venueAddress: 'venueAddress',
    lightingNotes: 'lightingNotes',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ShootScalarFieldEnum = (typeof ShootScalarFieldEnum)[keyof typeof ShootScalarFieldEnum]


  export const ShotListScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    packageId: 'packageId',
    name: 'name',
    status: 'status',
    eventType: 'eventType',
    aiGenerated: 'aiGenerated',
    sections: 'sections',
    totalShots: 'totalShots',
    mustHaveCount: 'mustHaveCount',
    estimatedTime: 'estimatedTime',
    equipmentList: 'equipmentList',
    lightingPlan: 'lightingPlan',
    backupPlans: 'backupPlans',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ShotListScalarFieldEnum = (typeof ShotListScalarFieldEnum)[keyof typeof ShotListScalarFieldEnum]


  export const GalleryScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    shootId: 'shootId',
    name: 'name',
    status: 'status',
    totalPhotos: 'totalPhotos',
    selectedPhotos: 'selectedPhotos',
    aiCurated: 'aiCurated',
    curationData: 'curationData',
    publicUrl: 'publicUrl',
    password: 'password',
    expiresAt: 'expiresAt',
    downloadEnabled: 'downloadEnabled',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type GalleryScalarFieldEnum = (typeof GalleryScalarFieldEnum)[keyof typeof GalleryScalarFieldEnum]


  export const GalleryPhotoScalarFieldEnum: {
    id: 'id',
    galleryId: 'galleryId',
    filename: 'filename',
    url: 'url',
    thumbnailUrl: 'thumbnailUrl',
    qualityScore: 'qualityScore',
    category: 'category',
    isHighlight: 'isHighlight',
    aiReasoning: 'aiReasoning',
    technicalQuality: 'technicalQuality',
    emotionalImpact: 'emotionalImpact',
    takenAt: 'takenAt',
    camera: 'camera',
    lens: 'lens',
    settings: 'settings',
    selected: 'selected',
    rejected: 'rejected',
    rejectionReason: 'rejectionReason',
    createdAt: 'createdAt'
  };

  export type GalleryPhotoScalarFieldEnum = (typeof GalleryPhotoScalarFieldEnum)[keyof typeof GalleryPhotoScalarFieldEnum]


  export const InvoiceScalarFieldEnum: {
    id: 'id',
    tenantId: 'tenantId',
    clientId: 'clientId',
    packageId: 'packageId',
    invoiceNumber: 'invoiceNumber',
    status: 'status',
    items: 'items',
    subtotal: 'subtotal',
    tax: 'tax',
    total: 'total',
    dueDate: 'dueDate',
    paidAt: 'paidAt',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type InvoiceScalarFieldEnum = (typeof InvoiceScalarFieldEnum)[keyof typeof InvoiceScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'PackageStatus'
   */
  export type EnumPackageStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PackageStatus'>
    


  /**
   * Reference to a field of type 'PackageStatus[]'
   */
  export type ListEnumPackageStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PackageStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Json[]'
   */
  export type ListJsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json[]'>
    


  /**
   * Reference to a field of type 'ShotListStatus'
   */
  export type EnumShotListStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ShotListStatus'>
    


  /**
   * Reference to a field of type 'ShotListStatus[]'
   */
  export type ListEnumShotListStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ShotListStatus[]'>
    


  /**
   * Reference to a field of type 'GalleryStatus'
   */
  export type EnumGalleryStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'GalleryStatus'>
    


  /**
   * Reference to a field of type 'GalleryStatus[]'
   */
  export type ListEnumGalleryStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'GalleryStatus[]'>
    


  /**
   * Reference to a field of type 'InvoiceStatus'
   */
  export type EnumInvoiceStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InvoiceStatus'>
    


  /**
   * Reference to a field of type 'InvoiceStatus[]'
   */
  export type ListEnumInvoiceStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InvoiceStatus[]'>
    
  /**
   * Deep Input Types
   */


  export type TenantWhereInput = {
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    id?: StringFilter<"Tenant"> | string
    name?: StringFilter<"Tenant"> | string
    slug?: StringFilter<"Tenant"> | string
    plan?: StringFilter<"Tenant"> | string
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
    users?: UserListRelationFilter
    packages?: PackageListRelationFilter
    shoots?: ShootListRelationFilter
    shotLists?: ShotListListRelationFilter
    galleries?: GalleryListRelationFilter
    clients?: ClientListRelationFilter
    invoices?: InvoiceListRelationFilter
  }

  export type TenantOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    plan?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    users?: UserOrderByRelationAggregateInput
    packages?: PackageOrderByRelationAggregateInput
    shoots?: ShootOrderByRelationAggregateInput
    shotLists?: ShotListOrderByRelationAggregateInput
    galleries?: GalleryOrderByRelationAggregateInput
    clients?: ClientOrderByRelationAggregateInput
    invoices?: InvoiceOrderByRelationAggregateInput
  }

  export type TenantWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: TenantWhereInput | TenantWhereInput[]
    OR?: TenantWhereInput[]
    NOT?: TenantWhereInput | TenantWhereInput[]
    name?: StringFilter<"Tenant"> | string
    plan?: StringFilter<"Tenant"> | string
    createdAt?: DateTimeFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeFilter<"Tenant"> | Date | string
    users?: UserListRelationFilter
    packages?: PackageListRelationFilter
    shoots?: ShootListRelationFilter
    shotLists?: ShotListListRelationFilter
    galleries?: GalleryListRelationFilter
    clients?: ClientListRelationFilter
    invoices?: InvoiceListRelationFilter
  }, "id" | "slug">

  export type TenantOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    plan?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TenantCountOrderByAggregateInput
    _max?: TenantMaxOrderByAggregateInput
    _min?: TenantMinOrderByAggregateInput
  }

  export type TenantScalarWhereWithAggregatesInput = {
    AND?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    OR?: TenantScalarWhereWithAggregatesInput[]
    NOT?: TenantScalarWhereWithAggregatesInput | TenantScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Tenant"> | string
    name?: StringWithAggregatesFilter<"Tenant"> | string
    slug?: StringWithAggregatesFilter<"Tenant"> | string
    plan?: StringWithAggregatesFilter<"Tenant"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Tenant"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    passwordHash?: StringFilter<"User"> | string
    role?: StringFilter<"User"> | string
    tenantId?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    tenantId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    passwordHash?: StringFilter<"User"> | string
    role?: StringFilter<"User"> | string
    tenantId?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    tenantId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    passwordHash?: StringWithAggregatesFilter<"User"> | string
    role?: StringWithAggregatesFilter<"User"> | string
    tenantId?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type ClientWhereInput = {
    AND?: ClientWhereInput | ClientWhereInput[]
    OR?: ClientWhereInput[]
    NOT?: ClientWhereInput | ClientWhereInput[]
    id?: StringFilter<"Client"> | string
    tenantId?: StringFilter<"Client"> | string
    name?: StringFilter<"Client"> | string
    email?: StringFilter<"Client"> | string
    phone?: StringNullableFilter<"Client"> | string | null
    address?: StringNullableFilter<"Client"> | string | null
    type?: StringFilter<"Client"> | string
    tags?: StringNullableListFilter<"Client">
    notes?: StringNullableFilter<"Client"> | string | null
    createdAt?: DateTimeFilter<"Client"> | Date | string
    updatedAt?: DateTimeFilter<"Client"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    packages?: PackageListRelationFilter
    invoices?: InvoiceListRelationFilter
  }

  export type ClientOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    type?: SortOrder
    tags?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
    packages?: PackageOrderByRelationAggregateInput
    invoices?: InvoiceOrderByRelationAggregateInput
  }

  export type ClientWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ClientWhereInput | ClientWhereInput[]
    OR?: ClientWhereInput[]
    NOT?: ClientWhereInput | ClientWhereInput[]
    tenantId?: StringFilter<"Client"> | string
    name?: StringFilter<"Client"> | string
    email?: StringFilter<"Client"> | string
    phone?: StringNullableFilter<"Client"> | string | null
    address?: StringNullableFilter<"Client"> | string | null
    type?: StringFilter<"Client"> | string
    tags?: StringNullableListFilter<"Client">
    notes?: StringNullableFilter<"Client"> | string | null
    createdAt?: DateTimeFilter<"Client"> | Date | string
    updatedAt?: DateTimeFilter<"Client"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    packages?: PackageListRelationFilter
    invoices?: InvoiceListRelationFilter
  }, "id">

  export type ClientOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    type?: SortOrder
    tags?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ClientCountOrderByAggregateInput
    _max?: ClientMaxOrderByAggregateInput
    _min?: ClientMinOrderByAggregateInput
  }

  export type ClientScalarWhereWithAggregatesInput = {
    AND?: ClientScalarWhereWithAggregatesInput | ClientScalarWhereWithAggregatesInput[]
    OR?: ClientScalarWhereWithAggregatesInput[]
    NOT?: ClientScalarWhereWithAggregatesInput | ClientScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Client"> | string
    tenantId?: StringWithAggregatesFilter<"Client"> | string
    name?: StringWithAggregatesFilter<"Client"> | string
    email?: StringWithAggregatesFilter<"Client"> | string
    phone?: StringNullableWithAggregatesFilter<"Client"> | string | null
    address?: StringNullableWithAggregatesFilter<"Client"> | string | null
    type?: StringWithAggregatesFilter<"Client"> | string
    tags?: StringNullableListFilter<"Client">
    notes?: StringNullableWithAggregatesFilter<"Client"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Client"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Client"> | Date | string
  }

  export type PackageWhereInput = {
    AND?: PackageWhereInput | PackageWhereInput[]
    OR?: PackageWhereInput[]
    NOT?: PackageWhereInput | PackageWhereInput[]
    id?: StringFilter<"Package"> | string
    tenantId?: StringFilter<"Package"> | string
    clientId?: StringFilter<"Package"> | string
    title?: StringFilter<"Package"> | string
    status?: EnumPackageStatusFilter<"Package"> | $Enums.PackageStatus
    eventType?: StringNullableFilter<"Package"> | string | null
    eventDate?: DateTimeNullableFilter<"Package"> | Date | string | null
    shotCount?: IntNullableFilter<"Package"> | number | null
    deliveryDays?: IntNullableFilter<"Package"> | number | null
    galleryUrl?: StringNullableFilter<"Package"> | string | null
    editingHours?: FloatNullableFilter<"Package"> | number | null
    styleTags?: StringNullableListFilter<"Package">
    equipment?: StringNullableListFilter<"Package">
    secondShooter?: BoolFilter<"Package"> | boolean
    rawFilesIncluded?: BoolFilter<"Package"> | boolean
    timeline?: JsonNullableFilter<"Package">
    basePrice?: IntNullableFilter<"Package"> | number | null
    travelCosts?: IntNullableFilter<"Package"> | number | null
    totalPrice?: IntNullableFilter<"Package"> | number | null
    notes?: StringNullableFilter<"Package"> | string | null
    createdAt?: DateTimeFilter<"Package"> | Date | string
    updatedAt?: DateTimeFilter<"Package"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    client?: XOR<ClientScalarRelationFilter, ClientWhereInput>
    shoots?: ShootListRelationFilter
    addons?: PackageAddonListRelationFilter
    invoices?: InvoiceListRelationFilter
    shotLists?: ShotListListRelationFilter
  }

  export type PackageOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    clientId?: SortOrder
    title?: SortOrder
    status?: SortOrder
    eventType?: SortOrderInput | SortOrder
    eventDate?: SortOrderInput | SortOrder
    shotCount?: SortOrderInput | SortOrder
    deliveryDays?: SortOrderInput | SortOrder
    galleryUrl?: SortOrderInput | SortOrder
    editingHours?: SortOrderInput | SortOrder
    styleTags?: SortOrder
    equipment?: SortOrder
    secondShooter?: SortOrder
    rawFilesIncluded?: SortOrder
    timeline?: SortOrderInput | SortOrder
    basePrice?: SortOrderInput | SortOrder
    travelCosts?: SortOrderInput | SortOrder
    totalPrice?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
    client?: ClientOrderByWithRelationInput
    shoots?: ShootOrderByRelationAggregateInput
    addons?: PackageAddonOrderByRelationAggregateInput
    invoices?: InvoiceOrderByRelationAggregateInput
    shotLists?: ShotListOrderByRelationAggregateInput
  }

  export type PackageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PackageWhereInput | PackageWhereInput[]
    OR?: PackageWhereInput[]
    NOT?: PackageWhereInput | PackageWhereInput[]
    tenantId?: StringFilter<"Package"> | string
    clientId?: StringFilter<"Package"> | string
    title?: StringFilter<"Package"> | string
    status?: EnumPackageStatusFilter<"Package"> | $Enums.PackageStatus
    eventType?: StringNullableFilter<"Package"> | string | null
    eventDate?: DateTimeNullableFilter<"Package"> | Date | string | null
    shotCount?: IntNullableFilter<"Package"> | number | null
    deliveryDays?: IntNullableFilter<"Package"> | number | null
    galleryUrl?: StringNullableFilter<"Package"> | string | null
    editingHours?: FloatNullableFilter<"Package"> | number | null
    styleTags?: StringNullableListFilter<"Package">
    equipment?: StringNullableListFilter<"Package">
    secondShooter?: BoolFilter<"Package"> | boolean
    rawFilesIncluded?: BoolFilter<"Package"> | boolean
    timeline?: JsonNullableFilter<"Package">
    basePrice?: IntNullableFilter<"Package"> | number | null
    travelCosts?: IntNullableFilter<"Package"> | number | null
    totalPrice?: IntNullableFilter<"Package"> | number | null
    notes?: StringNullableFilter<"Package"> | string | null
    createdAt?: DateTimeFilter<"Package"> | Date | string
    updatedAt?: DateTimeFilter<"Package"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    client?: XOR<ClientScalarRelationFilter, ClientWhereInput>
    shoots?: ShootListRelationFilter
    addons?: PackageAddonListRelationFilter
    invoices?: InvoiceListRelationFilter
    shotLists?: ShotListListRelationFilter
  }, "id">

  export type PackageOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    clientId?: SortOrder
    title?: SortOrder
    status?: SortOrder
    eventType?: SortOrderInput | SortOrder
    eventDate?: SortOrderInput | SortOrder
    shotCount?: SortOrderInput | SortOrder
    deliveryDays?: SortOrderInput | SortOrder
    galleryUrl?: SortOrderInput | SortOrder
    editingHours?: SortOrderInput | SortOrder
    styleTags?: SortOrder
    equipment?: SortOrder
    secondShooter?: SortOrder
    rawFilesIncluded?: SortOrder
    timeline?: SortOrderInput | SortOrder
    basePrice?: SortOrderInput | SortOrder
    travelCosts?: SortOrderInput | SortOrder
    totalPrice?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PackageCountOrderByAggregateInput
    _avg?: PackageAvgOrderByAggregateInput
    _max?: PackageMaxOrderByAggregateInput
    _min?: PackageMinOrderByAggregateInput
    _sum?: PackageSumOrderByAggregateInput
  }

  export type PackageScalarWhereWithAggregatesInput = {
    AND?: PackageScalarWhereWithAggregatesInput | PackageScalarWhereWithAggregatesInput[]
    OR?: PackageScalarWhereWithAggregatesInput[]
    NOT?: PackageScalarWhereWithAggregatesInput | PackageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Package"> | string
    tenantId?: StringWithAggregatesFilter<"Package"> | string
    clientId?: StringWithAggregatesFilter<"Package"> | string
    title?: StringWithAggregatesFilter<"Package"> | string
    status?: EnumPackageStatusWithAggregatesFilter<"Package"> | $Enums.PackageStatus
    eventType?: StringNullableWithAggregatesFilter<"Package"> | string | null
    eventDate?: DateTimeNullableWithAggregatesFilter<"Package"> | Date | string | null
    shotCount?: IntNullableWithAggregatesFilter<"Package"> | number | null
    deliveryDays?: IntNullableWithAggregatesFilter<"Package"> | number | null
    galleryUrl?: StringNullableWithAggregatesFilter<"Package"> | string | null
    editingHours?: FloatNullableWithAggregatesFilter<"Package"> | number | null
    styleTags?: StringNullableListFilter<"Package">
    equipment?: StringNullableListFilter<"Package">
    secondShooter?: BoolWithAggregatesFilter<"Package"> | boolean
    rawFilesIncluded?: BoolWithAggregatesFilter<"Package"> | boolean
    timeline?: JsonNullableWithAggregatesFilter<"Package">
    basePrice?: IntNullableWithAggregatesFilter<"Package"> | number | null
    travelCosts?: IntNullableWithAggregatesFilter<"Package"> | number | null
    totalPrice?: IntNullableWithAggregatesFilter<"Package"> | number | null
    notes?: StringNullableWithAggregatesFilter<"Package"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Package"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Package"> | Date | string
  }

  export type PackageAddonWhereInput = {
    AND?: PackageAddonWhereInput | PackageAddonWhereInput[]
    OR?: PackageAddonWhereInput[]
    NOT?: PackageAddonWhereInput | PackageAddonWhereInput[]
    id?: StringFilter<"PackageAddon"> | string
    packageId?: StringFilter<"PackageAddon"> | string
    name?: StringFilter<"PackageAddon"> | string
    description?: StringNullableFilter<"PackageAddon"> | string | null
    price?: IntFilter<"PackageAddon"> | number
    quantity?: IntFilter<"PackageAddon"> | number
    createdAt?: DateTimeFilter<"PackageAddon"> | Date | string
    package?: XOR<PackageScalarRelationFilter, PackageWhereInput>
  }

  export type PackageAddonOrderByWithRelationInput = {
    id?: SortOrder
    packageId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    price?: SortOrder
    quantity?: SortOrder
    createdAt?: SortOrder
    package?: PackageOrderByWithRelationInput
  }

  export type PackageAddonWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PackageAddonWhereInput | PackageAddonWhereInput[]
    OR?: PackageAddonWhereInput[]
    NOT?: PackageAddonWhereInput | PackageAddonWhereInput[]
    packageId?: StringFilter<"PackageAddon"> | string
    name?: StringFilter<"PackageAddon"> | string
    description?: StringNullableFilter<"PackageAddon"> | string | null
    price?: IntFilter<"PackageAddon"> | number
    quantity?: IntFilter<"PackageAddon"> | number
    createdAt?: DateTimeFilter<"PackageAddon"> | Date | string
    package?: XOR<PackageScalarRelationFilter, PackageWhereInput>
  }, "id">

  export type PackageAddonOrderByWithAggregationInput = {
    id?: SortOrder
    packageId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    price?: SortOrder
    quantity?: SortOrder
    createdAt?: SortOrder
    _count?: PackageAddonCountOrderByAggregateInput
    _avg?: PackageAddonAvgOrderByAggregateInput
    _max?: PackageAddonMaxOrderByAggregateInput
    _min?: PackageAddonMinOrderByAggregateInput
    _sum?: PackageAddonSumOrderByAggregateInput
  }

  export type PackageAddonScalarWhereWithAggregatesInput = {
    AND?: PackageAddonScalarWhereWithAggregatesInput | PackageAddonScalarWhereWithAggregatesInput[]
    OR?: PackageAddonScalarWhereWithAggregatesInput[]
    NOT?: PackageAddonScalarWhereWithAggregatesInput | PackageAddonScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PackageAddon"> | string
    packageId?: StringWithAggregatesFilter<"PackageAddon"> | string
    name?: StringWithAggregatesFilter<"PackageAddon"> | string
    description?: StringNullableWithAggregatesFilter<"PackageAddon"> | string | null
    price?: IntWithAggregatesFilter<"PackageAddon"> | number
    quantity?: IntWithAggregatesFilter<"PackageAddon"> | number
    createdAt?: DateTimeWithAggregatesFilter<"PackageAddon"> | Date | string
  }

  export type ShootWhereInput = {
    AND?: ShootWhereInput | ShootWhereInput[]
    OR?: ShootWhereInput[]
    NOT?: ShootWhereInput | ShootWhereInput[]
    id?: StringFilter<"Shoot"> | string
    tenantId?: StringFilter<"Shoot"> | string
    packageId?: StringFilter<"Shoot"> | string
    date?: DateTimeFilter<"Shoot"> | Date | string
    startTime?: StringFilter<"Shoot"> | string
    endTime?: StringFilter<"Shoot"> | string
    shotListId?: StringNullableFilter<"Shoot"> | string | null
    timeline?: JsonNullableFilter<"Shoot">
    locations?: JsonNullableListFilter<"Shoot">
    sunsetTime?: DateTimeNullableFilter<"Shoot"> | Date | string | null
    weatherForecast?: JsonNullableFilter<"Shoot">
    venueType?: StringNullableFilter<"Shoot"> | string | null
    venueName?: StringNullableFilter<"Shoot"> | string | null
    venueAddress?: StringNullableFilter<"Shoot"> | string | null
    lightingNotes?: StringNullableFilter<"Shoot"> | string | null
    notes?: StringNullableFilter<"Shoot"> | string | null
    createdAt?: DateTimeFilter<"Shoot"> | Date | string
    updatedAt?: DateTimeFilter<"Shoot"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    package?: XOR<PackageScalarRelationFilter, PackageWhereInput>
    shotList?: XOR<ShotListNullableScalarRelationFilter, ShotListWhereInput> | null
    galleries?: GalleryListRelationFilter
  }

  export type ShootOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packageId?: SortOrder
    date?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    shotListId?: SortOrderInput | SortOrder
    timeline?: SortOrderInput | SortOrder
    locations?: SortOrder
    sunsetTime?: SortOrderInput | SortOrder
    weatherForecast?: SortOrderInput | SortOrder
    venueType?: SortOrderInput | SortOrder
    venueName?: SortOrderInput | SortOrder
    venueAddress?: SortOrderInput | SortOrder
    lightingNotes?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
    package?: PackageOrderByWithRelationInput
    shotList?: ShotListOrderByWithRelationInput
    galleries?: GalleryOrderByRelationAggregateInput
  }

  export type ShootWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    shotListId?: string
    AND?: ShootWhereInput | ShootWhereInput[]
    OR?: ShootWhereInput[]
    NOT?: ShootWhereInput | ShootWhereInput[]
    tenantId?: StringFilter<"Shoot"> | string
    packageId?: StringFilter<"Shoot"> | string
    date?: DateTimeFilter<"Shoot"> | Date | string
    startTime?: StringFilter<"Shoot"> | string
    endTime?: StringFilter<"Shoot"> | string
    timeline?: JsonNullableFilter<"Shoot">
    locations?: JsonNullableListFilter<"Shoot">
    sunsetTime?: DateTimeNullableFilter<"Shoot"> | Date | string | null
    weatherForecast?: JsonNullableFilter<"Shoot">
    venueType?: StringNullableFilter<"Shoot"> | string | null
    venueName?: StringNullableFilter<"Shoot"> | string | null
    venueAddress?: StringNullableFilter<"Shoot"> | string | null
    lightingNotes?: StringNullableFilter<"Shoot"> | string | null
    notes?: StringNullableFilter<"Shoot"> | string | null
    createdAt?: DateTimeFilter<"Shoot"> | Date | string
    updatedAt?: DateTimeFilter<"Shoot"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    package?: XOR<PackageScalarRelationFilter, PackageWhereInput>
    shotList?: XOR<ShotListNullableScalarRelationFilter, ShotListWhereInput> | null
    galleries?: GalleryListRelationFilter
  }, "id" | "shotListId">

  export type ShootOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packageId?: SortOrder
    date?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    shotListId?: SortOrderInput | SortOrder
    timeline?: SortOrderInput | SortOrder
    locations?: SortOrder
    sunsetTime?: SortOrderInput | SortOrder
    weatherForecast?: SortOrderInput | SortOrder
    venueType?: SortOrderInput | SortOrder
    venueName?: SortOrderInput | SortOrder
    venueAddress?: SortOrderInput | SortOrder
    lightingNotes?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ShootCountOrderByAggregateInput
    _max?: ShootMaxOrderByAggregateInput
    _min?: ShootMinOrderByAggregateInput
  }

  export type ShootScalarWhereWithAggregatesInput = {
    AND?: ShootScalarWhereWithAggregatesInput | ShootScalarWhereWithAggregatesInput[]
    OR?: ShootScalarWhereWithAggregatesInput[]
    NOT?: ShootScalarWhereWithAggregatesInput | ShootScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Shoot"> | string
    tenantId?: StringWithAggregatesFilter<"Shoot"> | string
    packageId?: StringWithAggregatesFilter<"Shoot"> | string
    date?: DateTimeWithAggregatesFilter<"Shoot"> | Date | string
    startTime?: StringWithAggregatesFilter<"Shoot"> | string
    endTime?: StringWithAggregatesFilter<"Shoot"> | string
    shotListId?: StringNullableWithAggregatesFilter<"Shoot"> | string | null
    timeline?: JsonNullableWithAggregatesFilter<"Shoot">
    locations?: JsonNullableListFilter<"Shoot">
    sunsetTime?: DateTimeNullableWithAggregatesFilter<"Shoot"> | Date | string | null
    weatherForecast?: JsonNullableWithAggregatesFilter<"Shoot">
    venueType?: StringNullableWithAggregatesFilter<"Shoot"> | string | null
    venueName?: StringNullableWithAggregatesFilter<"Shoot"> | string | null
    venueAddress?: StringNullableWithAggregatesFilter<"Shoot"> | string | null
    lightingNotes?: StringNullableWithAggregatesFilter<"Shoot"> | string | null
    notes?: StringNullableWithAggregatesFilter<"Shoot"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Shoot"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Shoot"> | Date | string
  }

  export type ShotListWhereInput = {
    AND?: ShotListWhereInput | ShotListWhereInput[]
    OR?: ShotListWhereInput[]
    NOT?: ShotListWhereInput | ShotListWhereInput[]
    id?: StringFilter<"ShotList"> | string
    tenantId?: StringFilter<"ShotList"> | string
    packageId?: StringNullableFilter<"ShotList"> | string | null
    name?: StringFilter<"ShotList"> | string
    status?: EnumShotListStatusFilter<"ShotList"> | $Enums.ShotListStatus
    eventType?: StringFilter<"ShotList"> | string
    aiGenerated?: BoolFilter<"ShotList"> | boolean
    sections?: JsonFilter<"ShotList">
    totalShots?: IntFilter<"ShotList"> | number
    mustHaveCount?: IntFilter<"ShotList"> | number
    estimatedTime?: IntNullableFilter<"ShotList"> | number | null
    equipmentList?: JsonNullableFilter<"ShotList">
    lightingPlan?: JsonNullableFilter<"ShotList">
    backupPlans?: JsonNullableFilter<"ShotList">
    createdAt?: DateTimeFilter<"ShotList"> | Date | string
    updatedAt?: DateTimeFilter<"ShotList"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    package?: XOR<PackageNullableScalarRelationFilter, PackageWhereInput> | null
    shoot?: XOR<ShootNullableScalarRelationFilter, ShootWhereInput> | null
  }

  export type ShotListOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packageId?: SortOrderInput | SortOrder
    name?: SortOrder
    status?: SortOrder
    eventType?: SortOrder
    aiGenerated?: SortOrder
    sections?: SortOrder
    totalShots?: SortOrder
    mustHaveCount?: SortOrder
    estimatedTime?: SortOrderInput | SortOrder
    equipmentList?: SortOrderInput | SortOrder
    lightingPlan?: SortOrderInput | SortOrder
    backupPlans?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
    package?: PackageOrderByWithRelationInput
    shoot?: ShootOrderByWithRelationInput
  }

  export type ShotListWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ShotListWhereInput | ShotListWhereInput[]
    OR?: ShotListWhereInput[]
    NOT?: ShotListWhereInput | ShotListWhereInput[]
    tenantId?: StringFilter<"ShotList"> | string
    packageId?: StringNullableFilter<"ShotList"> | string | null
    name?: StringFilter<"ShotList"> | string
    status?: EnumShotListStatusFilter<"ShotList"> | $Enums.ShotListStatus
    eventType?: StringFilter<"ShotList"> | string
    aiGenerated?: BoolFilter<"ShotList"> | boolean
    sections?: JsonFilter<"ShotList">
    totalShots?: IntFilter<"ShotList"> | number
    mustHaveCount?: IntFilter<"ShotList"> | number
    estimatedTime?: IntNullableFilter<"ShotList"> | number | null
    equipmentList?: JsonNullableFilter<"ShotList">
    lightingPlan?: JsonNullableFilter<"ShotList">
    backupPlans?: JsonNullableFilter<"ShotList">
    createdAt?: DateTimeFilter<"ShotList"> | Date | string
    updatedAt?: DateTimeFilter<"ShotList"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    package?: XOR<PackageNullableScalarRelationFilter, PackageWhereInput> | null
    shoot?: XOR<ShootNullableScalarRelationFilter, ShootWhereInput> | null
  }, "id">

  export type ShotListOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packageId?: SortOrderInput | SortOrder
    name?: SortOrder
    status?: SortOrder
    eventType?: SortOrder
    aiGenerated?: SortOrder
    sections?: SortOrder
    totalShots?: SortOrder
    mustHaveCount?: SortOrder
    estimatedTime?: SortOrderInput | SortOrder
    equipmentList?: SortOrderInput | SortOrder
    lightingPlan?: SortOrderInput | SortOrder
    backupPlans?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ShotListCountOrderByAggregateInput
    _avg?: ShotListAvgOrderByAggregateInput
    _max?: ShotListMaxOrderByAggregateInput
    _min?: ShotListMinOrderByAggregateInput
    _sum?: ShotListSumOrderByAggregateInput
  }

  export type ShotListScalarWhereWithAggregatesInput = {
    AND?: ShotListScalarWhereWithAggregatesInput | ShotListScalarWhereWithAggregatesInput[]
    OR?: ShotListScalarWhereWithAggregatesInput[]
    NOT?: ShotListScalarWhereWithAggregatesInput | ShotListScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ShotList"> | string
    tenantId?: StringWithAggregatesFilter<"ShotList"> | string
    packageId?: StringNullableWithAggregatesFilter<"ShotList"> | string | null
    name?: StringWithAggregatesFilter<"ShotList"> | string
    status?: EnumShotListStatusWithAggregatesFilter<"ShotList"> | $Enums.ShotListStatus
    eventType?: StringWithAggregatesFilter<"ShotList"> | string
    aiGenerated?: BoolWithAggregatesFilter<"ShotList"> | boolean
    sections?: JsonWithAggregatesFilter<"ShotList">
    totalShots?: IntWithAggregatesFilter<"ShotList"> | number
    mustHaveCount?: IntWithAggregatesFilter<"ShotList"> | number
    estimatedTime?: IntNullableWithAggregatesFilter<"ShotList"> | number | null
    equipmentList?: JsonNullableWithAggregatesFilter<"ShotList">
    lightingPlan?: JsonNullableWithAggregatesFilter<"ShotList">
    backupPlans?: JsonNullableWithAggregatesFilter<"ShotList">
    createdAt?: DateTimeWithAggregatesFilter<"ShotList"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ShotList"> | Date | string
  }

  export type GalleryWhereInput = {
    AND?: GalleryWhereInput | GalleryWhereInput[]
    OR?: GalleryWhereInput[]
    NOT?: GalleryWhereInput | GalleryWhereInput[]
    id?: StringFilter<"Gallery"> | string
    tenantId?: StringFilter<"Gallery"> | string
    shootId?: StringFilter<"Gallery"> | string
    name?: StringFilter<"Gallery"> | string
    status?: EnumGalleryStatusFilter<"Gallery"> | $Enums.GalleryStatus
    totalPhotos?: IntFilter<"Gallery"> | number
    selectedPhotos?: IntFilter<"Gallery"> | number
    aiCurated?: BoolFilter<"Gallery"> | boolean
    curationData?: JsonNullableFilter<"Gallery">
    publicUrl?: StringNullableFilter<"Gallery"> | string | null
    password?: StringNullableFilter<"Gallery"> | string | null
    expiresAt?: DateTimeNullableFilter<"Gallery"> | Date | string | null
    downloadEnabled?: BoolFilter<"Gallery"> | boolean
    createdAt?: DateTimeFilter<"Gallery"> | Date | string
    updatedAt?: DateTimeFilter<"Gallery"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    shoot?: XOR<ShootScalarRelationFilter, ShootWhereInput>
    photos?: GalleryPhotoListRelationFilter
  }

  export type GalleryOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    shootId?: SortOrder
    name?: SortOrder
    status?: SortOrder
    totalPhotos?: SortOrder
    selectedPhotos?: SortOrder
    aiCurated?: SortOrder
    curationData?: SortOrderInput | SortOrder
    publicUrl?: SortOrderInput | SortOrder
    password?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    downloadEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
    shoot?: ShootOrderByWithRelationInput
    photos?: GalleryPhotoOrderByRelationAggregateInput
  }

  export type GalleryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    publicUrl?: string
    AND?: GalleryWhereInput | GalleryWhereInput[]
    OR?: GalleryWhereInput[]
    NOT?: GalleryWhereInput | GalleryWhereInput[]
    tenantId?: StringFilter<"Gallery"> | string
    shootId?: StringFilter<"Gallery"> | string
    name?: StringFilter<"Gallery"> | string
    status?: EnumGalleryStatusFilter<"Gallery"> | $Enums.GalleryStatus
    totalPhotos?: IntFilter<"Gallery"> | number
    selectedPhotos?: IntFilter<"Gallery"> | number
    aiCurated?: BoolFilter<"Gallery"> | boolean
    curationData?: JsonNullableFilter<"Gallery">
    password?: StringNullableFilter<"Gallery"> | string | null
    expiresAt?: DateTimeNullableFilter<"Gallery"> | Date | string | null
    downloadEnabled?: BoolFilter<"Gallery"> | boolean
    createdAt?: DateTimeFilter<"Gallery"> | Date | string
    updatedAt?: DateTimeFilter<"Gallery"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    shoot?: XOR<ShootScalarRelationFilter, ShootWhereInput>
    photos?: GalleryPhotoListRelationFilter
  }, "id" | "publicUrl">

  export type GalleryOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    shootId?: SortOrder
    name?: SortOrder
    status?: SortOrder
    totalPhotos?: SortOrder
    selectedPhotos?: SortOrder
    aiCurated?: SortOrder
    curationData?: SortOrderInput | SortOrder
    publicUrl?: SortOrderInput | SortOrder
    password?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    downloadEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GalleryCountOrderByAggregateInput
    _avg?: GalleryAvgOrderByAggregateInput
    _max?: GalleryMaxOrderByAggregateInput
    _min?: GalleryMinOrderByAggregateInput
    _sum?: GallerySumOrderByAggregateInput
  }

  export type GalleryScalarWhereWithAggregatesInput = {
    AND?: GalleryScalarWhereWithAggregatesInput | GalleryScalarWhereWithAggregatesInput[]
    OR?: GalleryScalarWhereWithAggregatesInput[]
    NOT?: GalleryScalarWhereWithAggregatesInput | GalleryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Gallery"> | string
    tenantId?: StringWithAggregatesFilter<"Gallery"> | string
    shootId?: StringWithAggregatesFilter<"Gallery"> | string
    name?: StringWithAggregatesFilter<"Gallery"> | string
    status?: EnumGalleryStatusWithAggregatesFilter<"Gallery"> | $Enums.GalleryStatus
    totalPhotos?: IntWithAggregatesFilter<"Gallery"> | number
    selectedPhotos?: IntWithAggregatesFilter<"Gallery"> | number
    aiCurated?: BoolWithAggregatesFilter<"Gallery"> | boolean
    curationData?: JsonNullableWithAggregatesFilter<"Gallery">
    publicUrl?: StringNullableWithAggregatesFilter<"Gallery"> | string | null
    password?: StringNullableWithAggregatesFilter<"Gallery"> | string | null
    expiresAt?: DateTimeNullableWithAggregatesFilter<"Gallery"> | Date | string | null
    downloadEnabled?: BoolWithAggregatesFilter<"Gallery"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Gallery"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Gallery"> | Date | string
  }

  export type GalleryPhotoWhereInput = {
    AND?: GalleryPhotoWhereInput | GalleryPhotoWhereInput[]
    OR?: GalleryPhotoWhereInput[]
    NOT?: GalleryPhotoWhereInput | GalleryPhotoWhereInput[]
    id?: StringFilter<"GalleryPhoto"> | string
    galleryId?: StringFilter<"GalleryPhoto"> | string
    filename?: StringFilter<"GalleryPhoto"> | string
    url?: StringFilter<"GalleryPhoto"> | string
    thumbnailUrl?: StringNullableFilter<"GalleryPhoto"> | string | null
    qualityScore?: FloatNullableFilter<"GalleryPhoto"> | number | null
    category?: StringNullableFilter<"GalleryPhoto"> | string | null
    isHighlight?: BoolFilter<"GalleryPhoto"> | boolean
    aiReasoning?: StringNullableFilter<"GalleryPhoto"> | string | null
    technicalQuality?: JsonNullableFilter<"GalleryPhoto">
    emotionalImpact?: FloatNullableFilter<"GalleryPhoto"> | number | null
    takenAt?: DateTimeNullableFilter<"GalleryPhoto"> | Date | string | null
    camera?: StringNullableFilter<"GalleryPhoto"> | string | null
    lens?: StringNullableFilter<"GalleryPhoto"> | string | null
    settings?: JsonNullableFilter<"GalleryPhoto">
    selected?: BoolFilter<"GalleryPhoto"> | boolean
    rejected?: BoolFilter<"GalleryPhoto"> | boolean
    rejectionReason?: StringNullableFilter<"GalleryPhoto"> | string | null
    createdAt?: DateTimeFilter<"GalleryPhoto"> | Date | string
    gallery?: XOR<GalleryScalarRelationFilter, GalleryWhereInput>
  }

  export type GalleryPhotoOrderByWithRelationInput = {
    id?: SortOrder
    galleryId?: SortOrder
    filename?: SortOrder
    url?: SortOrder
    thumbnailUrl?: SortOrderInput | SortOrder
    qualityScore?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    isHighlight?: SortOrder
    aiReasoning?: SortOrderInput | SortOrder
    technicalQuality?: SortOrderInput | SortOrder
    emotionalImpact?: SortOrderInput | SortOrder
    takenAt?: SortOrderInput | SortOrder
    camera?: SortOrderInput | SortOrder
    lens?: SortOrderInput | SortOrder
    settings?: SortOrderInput | SortOrder
    selected?: SortOrder
    rejected?: SortOrder
    rejectionReason?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    gallery?: GalleryOrderByWithRelationInput
  }

  export type GalleryPhotoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GalleryPhotoWhereInput | GalleryPhotoWhereInput[]
    OR?: GalleryPhotoWhereInput[]
    NOT?: GalleryPhotoWhereInput | GalleryPhotoWhereInput[]
    galleryId?: StringFilter<"GalleryPhoto"> | string
    filename?: StringFilter<"GalleryPhoto"> | string
    url?: StringFilter<"GalleryPhoto"> | string
    thumbnailUrl?: StringNullableFilter<"GalleryPhoto"> | string | null
    qualityScore?: FloatNullableFilter<"GalleryPhoto"> | number | null
    category?: StringNullableFilter<"GalleryPhoto"> | string | null
    isHighlight?: BoolFilter<"GalleryPhoto"> | boolean
    aiReasoning?: StringNullableFilter<"GalleryPhoto"> | string | null
    technicalQuality?: JsonNullableFilter<"GalleryPhoto">
    emotionalImpact?: FloatNullableFilter<"GalleryPhoto"> | number | null
    takenAt?: DateTimeNullableFilter<"GalleryPhoto"> | Date | string | null
    camera?: StringNullableFilter<"GalleryPhoto"> | string | null
    lens?: StringNullableFilter<"GalleryPhoto"> | string | null
    settings?: JsonNullableFilter<"GalleryPhoto">
    selected?: BoolFilter<"GalleryPhoto"> | boolean
    rejected?: BoolFilter<"GalleryPhoto"> | boolean
    rejectionReason?: StringNullableFilter<"GalleryPhoto"> | string | null
    createdAt?: DateTimeFilter<"GalleryPhoto"> | Date | string
    gallery?: XOR<GalleryScalarRelationFilter, GalleryWhereInput>
  }, "id">

  export type GalleryPhotoOrderByWithAggregationInput = {
    id?: SortOrder
    galleryId?: SortOrder
    filename?: SortOrder
    url?: SortOrder
    thumbnailUrl?: SortOrderInput | SortOrder
    qualityScore?: SortOrderInput | SortOrder
    category?: SortOrderInput | SortOrder
    isHighlight?: SortOrder
    aiReasoning?: SortOrderInput | SortOrder
    technicalQuality?: SortOrderInput | SortOrder
    emotionalImpact?: SortOrderInput | SortOrder
    takenAt?: SortOrderInput | SortOrder
    camera?: SortOrderInput | SortOrder
    lens?: SortOrderInput | SortOrder
    settings?: SortOrderInput | SortOrder
    selected?: SortOrder
    rejected?: SortOrder
    rejectionReason?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: GalleryPhotoCountOrderByAggregateInput
    _avg?: GalleryPhotoAvgOrderByAggregateInput
    _max?: GalleryPhotoMaxOrderByAggregateInput
    _min?: GalleryPhotoMinOrderByAggregateInput
    _sum?: GalleryPhotoSumOrderByAggregateInput
  }

  export type GalleryPhotoScalarWhereWithAggregatesInput = {
    AND?: GalleryPhotoScalarWhereWithAggregatesInput | GalleryPhotoScalarWhereWithAggregatesInput[]
    OR?: GalleryPhotoScalarWhereWithAggregatesInput[]
    NOT?: GalleryPhotoScalarWhereWithAggregatesInput | GalleryPhotoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GalleryPhoto"> | string
    galleryId?: StringWithAggregatesFilter<"GalleryPhoto"> | string
    filename?: StringWithAggregatesFilter<"GalleryPhoto"> | string
    url?: StringWithAggregatesFilter<"GalleryPhoto"> | string
    thumbnailUrl?: StringNullableWithAggregatesFilter<"GalleryPhoto"> | string | null
    qualityScore?: FloatNullableWithAggregatesFilter<"GalleryPhoto"> | number | null
    category?: StringNullableWithAggregatesFilter<"GalleryPhoto"> | string | null
    isHighlight?: BoolWithAggregatesFilter<"GalleryPhoto"> | boolean
    aiReasoning?: StringNullableWithAggregatesFilter<"GalleryPhoto"> | string | null
    technicalQuality?: JsonNullableWithAggregatesFilter<"GalleryPhoto">
    emotionalImpact?: FloatNullableWithAggregatesFilter<"GalleryPhoto"> | number | null
    takenAt?: DateTimeNullableWithAggregatesFilter<"GalleryPhoto"> | Date | string | null
    camera?: StringNullableWithAggregatesFilter<"GalleryPhoto"> | string | null
    lens?: StringNullableWithAggregatesFilter<"GalleryPhoto"> | string | null
    settings?: JsonNullableWithAggregatesFilter<"GalleryPhoto">
    selected?: BoolWithAggregatesFilter<"GalleryPhoto"> | boolean
    rejected?: BoolWithAggregatesFilter<"GalleryPhoto"> | boolean
    rejectionReason?: StringNullableWithAggregatesFilter<"GalleryPhoto"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"GalleryPhoto"> | Date | string
  }

  export type InvoiceWhereInput = {
    AND?: InvoiceWhereInput | InvoiceWhereInput[]
    OR?: InvoiceWhereInput[]
    NOT?: InvoiceWhereInput | InvoiceWhereInput[]
    id?: StringFilter<"Invoice"> | string
    tenantId?: StringFilter<"Invoice"> | string
    clientId?: StringFilter<"Invoice"> | string
    packageId?: StringNullableFilter<"Invoice"> | string | null
    invoiceNumber?: StringFilter<"Invoice"> | string
    status?: EnumInvoiceStatusFilter<"Invoice"> | $Enums.InvoiceStatus
    items?: JsonFilter<"Invoice">
    subtotal?: IntFilter<"Invoice"> | number
    tax?: IntFilter<"Invoice"> | number
    total?: IntFilter<"Invoice"> | number
    dueDate?: DateTimeNullableFilter<"Invoice"> | Date | string | null
    paidAt?: DateTimeNullableFilter<"Invoice"> | Date | string | null
    notes?: StringNullableFilter<"Invoice"> | string | null
    createdAt?: DateTimeFilter<"Invoice"> | Date | string
    updatedAt?: DateTimeFilter<"Invoice"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    client?: XOR<ClientScalarRelationFilter, ClientWhereInput>
    package?: XOR<PackageNullableScalarRelationFilter, PackageWhereInput> | null
  }

  export type InvoiceOrderByWithRelationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    clientId?: SortOrder
    packageId?: SortOrderInput | SortOrder
    invoiceNumber?: SortOrder
    status?: SortOrder
    items?: SortOrder
    subtotal?: SortOrder
    tax?: SortOrder
    total?: SortOrder
    dueDate?: SortOrderInput | SortOrder
    paidAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    tenant?: TenantOrderByWithRelationInput
    client?: ClientOrderByWithRelationInput
    package?: PackageOrderByWithRelationInput
  }

  export type InvoiceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    invoiceNumber?: string
    AND?: InvoiceWhereInput | InvoiceWhereInput[]
    OR?: InvoiceWhereInput[]
    NOT?: InvoiceWhereInput | InvoiceWhereInput[]
    tenantId?: StringFilter<"Invoice"> | string
    clientId?: StringFilter<"Invoice"> | string
    packageId?: StringNullableFilter<"Invoice"> | string | null
    status?: EnumInvoiceStatusFilter<"Invoice"> | $Enums.InvoiceStatus
    items?: JsonFilter<"Invoice">
    subtotal?: IntFilter<"Invoice"> | number
    tax?: IntFilter<"Invoice"> | number
    total?: IntFilter<"Invoice"> | number
    dueDate?: DateTimeNullableFilter<"Invoice"> | Date | string | null
    paidAt?: DateTimeNullableFilter<"Invoice"> | Date | string | null
    notes?: StringNullableFilter<"Invoice"> | string | null
    createdAt?: DateTimeFilter<"Invoice"> | Date | string
    updatedAt?: DateTimeFilter<"Invoice"> | Date | string
    tenant?: XOR<TenantScalarRelationFilter, TenantWhereInput>
    client?: XOR<ClientScalarRelationFilter, ClientWhereInput>
    package?: XOR<PackageNullableScalarRelationFilter, PackageWhereInput> | null
  }, "id" | "invoiceNumber">

  export type InvoiceOrderByWithAggregationInput = {
    id?: SortOrder
    tenantId?: SortOrder
    clientId?: SortOrder
    packageId?: SortOrderInput | SortOrder
    invoiceNumber?: SortOrder
    status?: SortOrder
    items?: SortOrder
    subtotal?: SortOrder
    tax?: SortOrder
    total?: SortOrder
    dueDate?: SortOrderInput | SortOrder
    paidAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: InvoiceCountOrderByAggregateInput
    _avg?: InvoiceAvgOrderByAggregateInput
    _max?: InvoiceMaxOrderByAggregateInput
    _min?: InvoiceMinOrderByAggregateInput
    _sum?: InvoiceSumOrderByAggregateInput
  }

  export type InvoiceScalarWhereWithAggregatesInput = {
    AND?: InvoiceScalarWhereWithAggregatesInput | InvoiceScalarWhereWithAggregatesInput[]
    OR?: InvoiceScalarWhereWithAggregatesInput[]
    NOT?: InvoiceScalarWhereWithAggregatesInput | InvoiceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Invoice"> | string
    tenantId?: StringWithAggregatesFilter<"Invoice"> | string
    clientId?: StringWithAggregatesFilter<"Invoice"> | string
    packageId?: StringNullableWithAggregatesFilter<"Invoice"> | string | null
    invoiceNumber?: StringWithAggregatesFilter<"Invoice"> | string
    status?: EnumInvoiceStatusWithAggregatesFilter<"Invoice"> | $Enums.InvoiceStatus
    items?: JsonWithAggregatesFilter<"Invoice">
    subtotal?: IntWithAggregatesFilter<"Invoice"> | number
    tax?: IntWithAggregatesFilter<"Invoice"> | number
    total?: IntWithAggregatesFilter<"Invoice"> | number
    dueDate?: DateTimeNullableWithAggregatesFilter<"Invoice"> | Date | string | null
    paidAt?: DateTimeNullableWithAggregatesFilter<"Invoice"> | Date | string | null
    notes?: StringNullableWithAggregatesFilter<"Invoice"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Invoice"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Invoice"> | Date | string
  }

  export type TenantCreateInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutTenantInput
    packages?: PackageCreateNestedManyWithoutTenantInput
    shoots?: ShootCreateNestedManyWithoutTenantInput
    shotLists?: ShotListCreateNestedManyWithoutTenantInput
    galleries?: GalleryCreateNestedManyWithoutTenantInput
    clients?: ClientCreateNestedManyWithoutTenantInput
    invoices?: InvoiceCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutTenantInput
    packages?: PackageUncheckedCreateNestedManyWithoutTenantInput
    shoots?: ShootUncheckedCreateNestedManyWithoutTenantInput
    shotLists?: ShotListUncheckedCreateNestedManyWithoutTenantInput
    galleries?: GalleryUncheckedCreateNestedManyWithoutTenantInput
    clients?: ClientUncheckedCreateNestedManyWithoutTenantInput
    invoices?: InvoiceUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutTenantNestedInput
    packages?: PackageUpdateManyWithoutTenantNestedInput
    shoots?: ShootUpdateManyWithoutTenantNestedInput
    shotLists?: ShotListUpdateManyWithoutTenantNestedInput
    galleries?: GalleryUpdateManyWithoutTenantNestedInput
    clients?: ClientUpdateManyWithoutTenantNestedInput
    invoices?: InvoiceUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutTenantNestedInput
    packages?: PackageUncheckedUpdateManyWithoutTenantNestedInput
    shoots?: ShootUncheckedUpdateManyWithoutTenantNestedInput
    shotLists?: ShotListUncheckedUpdateManyWithoutTenantNestedInput
    galleries?: GalleryUncheckedUpdateManyWithoutTenantNestedInput
    clients?: ClientUncheckedUpdateManyWithoutTenantNestedInput
    invoices?: InvoiceUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type TenantCreateManyInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TenantUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id?: string
    email: string
    name?: string | null
    passwordHash: string
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutUsersInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    email: string
    name?: string | null
    passwordHash: string
    role?: string
    tenantId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutUsersNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateManyInput = {
    id?: string
    email: string
    name?: string | null
    passwordHash: string
    role?: string
    tenantId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClientCreateInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    type?: string
    tags?: ClientCreatetagsInput | string[]
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutClientsInput
    packages?: PackageCreateNestedManyWithoutClientInput
    invoices?: InvoiceCreateNestedManyWithoutClientInput
  }

  export type ClientUncheckedCreateInput = {
    id?: string
    tenantId: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    type?: string
    tags?: ClientCreatetagsInput | string[]
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    packages?: PackageUncheckedCreateNestedManyWithoutClientInput
    invoices?: InvoiceUncheckedCreateNestedManyWithoutClientInput
  }

  export type ClientUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    tags?: ClientUpdatetagsInput | string[]
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutClientsNestedInput
    packages?: PackageUpdateManyWithoutClientNestedInput
    invoices?: InvoiceUpdateManyWithoutClientNestedInput
  }

  export type ClientUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    tags?: ClientUpdatetagsInput | string[]
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    packages?: PackageUncheckedUpdateManyWithoutClientNestedInput
    invoices?: InvoiceUncheckedUpdateManyWithoutClientNestedInput
  }

  export type ClientCreateManyInput = {
    id?: string
    tenantId: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    type?: string
    tags?: ClientCreatetagsInput | string[]
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ClientUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    tags?: ClientUpdatetagsInput | string[]
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClientUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    tags?: ClientUpdatetagsInput | string[]
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PackageCreateInput = {
    id?: string
    title: string
    status?: $Enums.PackageStatus
    eventType?: string | null
    eventDate?: Date | string | null
    shotCount?: number | null
    deliveryDays?: number | null
    galleryUrl?: string | null
    editingHours?: number | null
    styleTags?: PackageCreatestyleTagsInput | string[]
    equipment?: PackageCreateequipmentInput | string[]
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: number | null
    travelCosts?: number | null
    totalPrice?: number | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutPackagesInput
    client: ClientCreateNestedOneWithoutPackagesInput
    shoots?: ShootCreateNestedManyWithoutPackageInput
    addons?: PackageAddonCreateNestedManyWithoutPackageInput
    invoices?: InvoiceCreateNestedManyWithoutPackageInput
    shotLists?: ShotListCreateNestedManyWithoutPackageInput
  }

  export type PackageUncheckedCreateInput = {
    id?: string
    tenantId: string
    clientId: string
    title: string
    status?: $Enums.PackageStatus
    eventType?: string | null
    eventDate?: Date | string | null
    shotCount?: number | null
    deliveryDays?: number | null
    galleryUrl?: string | null
    editingHours?: number | null
    styleTags?: PackageCreatestyleTagsInput | string[]
    equipment?: PackageCreateequipmentInput | string[]
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: number | null
    travelCosts?: number | null
    totalPrice?: number | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    shoots?: ShootUncheckedCreateNestedManyWithoutPackageInput
    addons?: PackageAddonUncheckedCreateNestedManyWithoutPackageInput
    invoices?: InvoiceUncheckedCreateNestedManyWithoutPackageInput
    shotLists?: ShotListUncheckedCreateNestedManyWithoutPackageInput
  }

  export type PackageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutPackagesNestedInput
    client?: ClientUpdateOneRequiredWithoutPackagesNestedInput
    shoots?: ShootUpdateManyWithoutPackageNestedInput
    addons?: PackageAddonUpdateManyWithoutPackageNestedInput
    invoices?: InvoiceUpdateManyWithoutPackageNestedInput
    shotLists?: ShotListUpdateManyWithoutPackageNestedInput
  }

  export type PackageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shoots?: ShootUncheckedUpdateManyWithoutPackageNestedInput
    addons?: PackageAddonUncheckedUpdateManyWithoutPackageNestedInput
    invoices?: InvoiceUncheckedUpdateManyWithoutPackageNestedInput
    shotLists?: ShotListUncheckedUpdateManyWithoutPackageNestedInput
  }

  export type PackageCreateManyInput = {
    id?: string
    tenantId: string
    clientId: string
    title: string
    status?: $Enums.PackageStatus
    eventType?: string | null
    eventDate?: Date | string | null
    shotCount?: number | null
    deliveryDays?: number | null
    galleryUrl?: string | null
    editingHours?: number | null
    styleTags?: PackageCreatestyleTagsInput | string[]
    equipment?: PackageCreateequipmentInput | string[]
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: number | null
    travelCosts?: number | null
    totalPrice?: number | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PackageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PackageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PackageAddonCreateInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    quantity?: number
    createdAt?: Date | string
    package: PackageCreateNestedOneWithoutAddonsInput
  }

  export type PackageAddonUncheckedCreateInput = {
    id?: string
    packageId: string
    name: string
    description?: string | null
    price: number
    quantity?: number
    createdAt?: Date | string
  }

  export type PackageAddonUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    package?: PackageUpdateOneRequiredWithoutAddonsNestedInput
  }

  export type PackageAddonUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    packageId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PackageAddonCreateManyInput = {
    id?: string
    packageId: string
    name: string
    description?: string | null
    price: number
    quantity?: number
    createdAt?: Date | string
  }

  export type PackageAddonUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PackageAddonUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    packageId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShootCreateInput = {
    id?: string
    date: Date | string
    startTime: string
    endTime: string
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootCreatelocationsInput | InputJsonValue[]
    sunsetTime?: Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: string | null
    venueName?: string | null
    venueAddress?: string | null
    lightingNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutShootsInput
    package: PackageCreateNestedOneWithoutShootsInput
    shotList?: ShotListCreateNestedOneWithoutShootInput
    galleries?: GalleryCreateNestedManyWithoutShootInput
  }

  export type ShootUncheckedCreateInput = {
    id?: string
    tenantId: string
    packageId: string
    date: Date | string
    startTime: string
    endTime: string
    shotListId?: string | null
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootCreatelocationsInput | InputJsonValue[]
    sunsetTime?: Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: string | null
    venueName?: string | null
    venueAddress?: string | null
    lightingNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    galleries?: GalleryUncheckedCreateNestedManyWithoutShootInput
  }

  export type ShootUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootUpdatelocationsInput | InputJsonValue[]
    sunsetTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: NullableStringFieldUpdateOperationsInput | string | null
    venueName?: NullableStringFieldUpdateOperationsInput | string | null
    venueAddress?: NullableStringFieldUpdateOperationsInput | string | null
    lightingNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutShootsNestedInput
    package?: PackageUpdateOneRequiredWithoutShootsNestedInput
    shotList?: ShotListUpdateOneWithoutShootNestedInput
    galleries?: GalleryUpdateManyWithoutShootNestedInput
  }

  export type ShootUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    packageId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    shotListId?: NullableStringFieldUpdateOperationsInput | string | null
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootUpdatelocationsInput | InputJsonValue[]
    sunsetTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: NullableStringFieldUpdateOperationsInput | string | null
    venueName?: NullableStringFieldUpdateOperationsInput | string | null
    venueAddress?: NullableStringFieldUpdateOperationsInput | string | null
    lightingNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    galleries?: GalleryUncheckedUpdateManyWithoutShootNestedInput
  }

  export type ShootCreateManyInput = {
    id?: string
    tenantId: string
    packageId: string
    date: Date | string
    startTime: string
    endTime: string
    shotListId?: string | null
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootCreatelocationsInput | InputJsonValue[]
    sunsetTime?: Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: string | null
    venueName?: string | null
    venueAddress?: string | null
    lightingNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ShootUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootUpdatelocationsInput | InputJsonValue[]
    sunsetTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: NullableStringFieldUpdateOperationsInput | string | null
    venueName?: NullableStringFieldUpdateOperationsInput | string | null
    venueAddress?: NullableStringFieldUpdateOperationsInput | string | null
    lightingNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShootUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    packageId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    shotListId?: NullableStringFieldUpdateOperationsInput | string | null
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootUpdatelocationsInput | InputJsonValue[]
    sunsetTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: NullableStringFieldUpdateOperationsInput | string | null
    venueName?: NullableStringFieldUpdateOperationsInput | string | null
    venueAddress?: NullableStringFieldUpdateOperationsInput | string | null
    lightingNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShotListCreateInput = {
    id?: string
    name: string
    status?: $Enums.ShotListStatus
    eventType: string
    aiGenerated?: boolean
    sections: JsonNullValueInput | InputJsonValue
    totalShots: number
    mustHaveCount: number
    estimatedTime?: number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutShotListsInput
    package?: PackageCreateNestedOneWithoutShotListsInput
    shoot?: ShootCreateNestedOneWithoutShotListInput
  }

  export type ShotListUncheckedCreateInput = {
    id?: string
    tenantId: string
    packageId?: string | null
    name: string
    status?: $Enums.ShotListStatus
    eventType: string
    aiGenerated?: boolean
    sections: JsonNullValueInput | InputJsonValue
    totalShots: number
    mustHaveCount: number
    estimatedTime?: number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    shoot?: ShootUncheckedCreateNestedOneWithoutShotListInput
  }

  export type ShotListUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumShotListStatusFieldUpdateOperationsInput | $Enums.ShotListStatus
    eventType?: StringFieldUpdateOperationsInput | string
    aiGenerated?: BoolFieldUpdateOperationsInput | boolean
    sections?: JsonNullValueInput | InputJsonValue
    totalShots?: IntFieldUpdateOperationsInput | number
    mustHaveCount?: IntFieldUpdateOperationsInput | number
    estimatedTime?: NullableIntFieldUpdateOperationsInput | number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutShotListsNestedInput
    package?: PackageUpdateOneWithoutShotListsNestedInput
    shoot?: ShootUpdateOneWithoutShotListNestedInput
  }

  export type ShotListUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    packageId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumShotListStatusFieldUpdateOperationsInput | $Enums.ShotListStatus
    eventType?: StringFieldUpdateOperationsInput | string
    aiGenerated?: BoolFieldUpdateOperationsInput | boolean
    sections?: JsonNullValueInput | InputJsonValue
    totalShots?: IntFieldUpdateOperationsInput | number
    mustHaveCount?: IntFieldUpdateOperationsInput | number
    estimatedTime?: NullableIntFieldUpdateOperationsInput | number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shoot?: ShootUncheckedUpdateOneWithoutShotListNestedInput
  }

  export type ShotListCreateManyInput = {
    id?: string
    tenantId: string
    packageId?: string | null
    name: string
    status?: $Enums.ShotListStatus
    eventType: string
    aiGenerated?: boolean
    sections: JsonNullValueInput | InputJsonValue
    totalShots: number
    mustHaveCount: number
    estimatedTime?: number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ShotListUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumShotListStatusFieldUpdateOperationsInput | $Enums.ShotListStatus
    eventType?: StringFieldUpdateOperationsInput | string
    aiGenerated?: BoolFieldUpdateOperationsInput | boolean
    sections?: JsonNullValueInput | InputJsonValue
    totalShots?: IntFieldUpdateOperationsInput | number
    mustHaveCount?: IntFieldUpdateOperationsInput | number
    estimatedTime?: NullableIntFieldUpdateOperationsInput | number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShotListUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    packageId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumShotListStatusFieldUpdateOperationsInput | $Enums.ShotListStatus
    eventType?: StringFieldUpdateOperationsInput | string
    aiGenerated?: BoolFieldUpdateOperationsInput | boolean
    sections?: JsonNullValueInput | InputJsonValue
    totalShots?: IntFieldUpdateOperationsInput | number
    mustHaveCount?: IntFieldUpdateOperationsInput | number
    estimatedTime?: NullableIntFieldUpdateOperationsInput | number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GalleryCreateInput = {
    id?: string
    name: string
    status?: $Enums.GalleryStatus
    totalPhotos?: number
    selectedPhotos?: number
    aiCurated?: boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: string | null
    password?: string | null
    expiresAt?: Date | string | null
    downloadEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutGalleriesInput
    shoot: ShootCreateNestedOneWithoutGalleriesInput
    photos?: GalleryPhotoCreateNestedManyWithoutGalleryInput
  }

  export type GalleryUncheckedCreateInput = {
    id?: string
    tenantId: string
    shootId: string
    name: string
    status?: $Enums.GalleryStatus
    totalPhotos?: number
    selectedPhotos?: number
    aiCurated?: boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: string | null
    password?: string | null
    expiresAt?: Date | string | null
    downloadEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    photos?: GalleryPhotoUncheckedCreateNestedManyWithoutGalleryInput
  }

  export type GalleryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumGalleryStatusFieldUpdateOperationsInput | $Enums.GalleryStatus
    totalPhotos?: IntFieldUpdateOperationsInput | number
    selectedPhotos?: IntFieldUpdateOperationsInput | number
    aiCurated?: BoolFieldUpdateOperationsInput | boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    downloadEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutGalleriesNestedInput
    shoot?: ShootUpdateOneRequiredWithoutGalleriesNestedInput
    photos?: GalleryPhotoUpdateManyWithoutGalleryNestedInput
  }

  export type GalleryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    shootId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumGalleryStatusFieldUpdateOperationsInput | $Enums.GalleryStatus
    totalPhotos?: IntFieldUpdateOperationsInput | number
    selectedPhotos?: IntFieldUpdateOperationsInput | number
    aiCurated?: BoolFieldUpdateOperationsInput | boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    downloadEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    photos?: GalleryPhotoUncheckedUpdateManyWithoutGalleryNestedInput
  }

  export type GalleryCreateManyInput = {
    id?: string
    tenantId: string
    shootId: string
    name: string
    status?: $Enums.GalleryStatus
    totalPhotos?: number
    selectedPhotos?: number
    aiCurated?: boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: string | null
    password?: string | null
    expiresAt?: Date | string | null
    downloadEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GalleryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumGalleryStatusFieldUpdateOperationsInput | $Enums.GalleryStatus
    totalPhotos?: IntFieldUpdateOperationsInput | number
    selectedPhotos?: IntFieldUpdateOperationsInput | number
    aiCurated?: BoolFieldUpdateOperationsInput | boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    downloadEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GalleryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    shootId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumGalleryStatusFieldUpdateOperationsInput | $Enums.GalleryStatus
    totalPhotos?: IntFieldUpdateOperationsInput | number
    selectedPhotos?: IntFieldUpdateOperationsInput | number
    aiCurated?: BoolFieldUpdateOperationsInput | boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    downloadEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GalleryPhotoCreateInput = {
    id?: string
    filename: string
    url: string
    thumbnailUrl?: string | null
    qualityScore?: number | null
    category?: string | null
    isHighlight?: boolean
    aiReasoning?: string | null
    technicalQuality?: NullableJsonNullValueInput | InputJsonValue
    emotionalImpact?: number | null
    takenAt?: Date | string | null
    camera?: string | null
    lens?: string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    selected?: boolean
    rejected?: boolean
    rejectionReason?: string | null
    createdAt?: Date | string
    gallery: GalleryCreateNestedOneWithoutPhotosInput
  }

  export type GalleryPhotoUncheckedCreateInput = {
    id?: string
    galleryId: string
    filename: string
    url: string
    thumbnailUrl?: string | null
    qualityScore?: number | null
    category?: string | null
    isHighlight?: boolean
    aiReasoning?: string | null
    technicalQuality?: NullableJsonNullValueInput | InputJsonValue
    emotionalImpact?: number | null
    takenAt?: Date | string | null
    camera?: string | null
    lens?: string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    selected?: boolean
    rejected?: boolean
    rejectionReason?: string | null
    createdAt?: Date | string
  }

  export type GalleryPhotoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    qualityScore?: NullableFloatFieldUpdateOperationsInput | number | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    isHighlight?: BoolFieldUpdateOperationsInput | boolean
    aiReasoning?: NullableStringFieldUpdateOperationsInput | string | null
    technicalQuality?: NullableJsonNullValueInput | InputJsonValue
    emotionalImpact?: NullableFloatFieldUpdateOperationsInput | number | null
    takenAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    camera?: NullableStringFieldUpdateOperationsInput | string | null
    lens?: NullableStringFieldUpdateOperationsInput | string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    selected?: BoolFieldUpdateOperationsInput | boolean
    rejected?: BoolFieldUpdateOperationsInput | boolean
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    gallery?: GalleryUpdateOneRequiredWithoutPhotosNestedInput
  }

  export type GalleryPhotoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    galleryId?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    qualityScore?: NullableFloatFieldUpdateOperationsInput | number | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    isHighlight?: BoolFieldUpdateOperationsInput | boolean
    aiReasoning?: NullableStringFieldUpdateOperationsInput | string | null
    technicalQuality?: NullableJsonNullValueInput | InputJsonValue
    emotionalImpact?: NullableFloatFieldUpdateOperationsInput | number | null
    takenAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    camera?: NullableStringFieldUpdateOperationsInput | string | null
    lens?: NullableStringFieldUpdateOperationsInput | string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    selected?: BoolFieldUpdateOperationsInput | boolean
    rejected?: BoolFieldUpdateOperationsInput | boolean
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GalleryPhotoCreateManyInput = {
    id?: string
    galleryId: string
    filename: string
    url: string
    thumbnailUrl?: string | null
    qualityScore?: number | null
    category?: string | null
    isHighlight?: boolean
    aiReasoning?: string | null
    technicalQuality?: NullableJsonNullValueInput | InputJsonValue
    emotionalImpact?: number | null
    takenAt?: Date | string | null
    camera?: string | null
    lens?: string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    selected?: boolean
    rejected?: boolean
    rejectionReason?: string | null
    createdAt?: Date | string
  }

  export type GalleryPhotoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    qualityScore?: NullableFloatFieldUpdateOperationsInput | number | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    isHighlight?: BoolFieldUpdateOperationsInput | boolean
    aiReasoning?: NullableStringFieldUpdateOperationsInput | string | null
    technicalQuality?: NullableJsonNullValueInput | InputJsonValue
    emotionalImpact?: NullableFloatFieldUpdateOperationsInput | number | null
    takenAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    camera?: NullableStringFieldUpdateOperationsInput | string | null
    lens?: NullableStringFieldUpdateOperationsInput | string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    selected?: BoolFieldUpdateOperationsInput | boolean
    rejected?: BoolFieldUpdateOperationsInput | boolean
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GalleryPhotoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    galleryId?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    qualityScore?: NullableFloatFieldUpdateOperationsInput | number | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    isHighlight?: BoolFieldUpdateOperationsInput | boolean
    aiReasoning?: NullableStringFieldUpdateOperationsInput | string | null
    technicalQuality?: NullableJsonNullValueInput | InputJsonValue
    emotionalImpact?: NullableFloatFieldUpdateOperationsInput | number | null
    takenAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    camera?: NullableStringFieldUpdateOperationsInput | string | null
    lens?: NullableStringFieldUpdateOperationsInput | string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    selected?: BoolFieldUpdateOperationsInput | boolean
    rejected?: BoolFieldUpdateOperationsInput | boolean
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvoiceCreateInput = {
    id?: string
    invoiceNumber: string
    status?: $Enums.InvoiceStatus
    items: JsonNullValueInput | InputJsonValue
    subtotal: number
    tax?: number
    total: number
    dueDate?: Date | string | null
    paidAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutInvoicesInput
    client: ClientCreateNestedOneWithoutInvoicesInput
    package?: PackageCreateNestedOneWithoutInvoicesInput
  }

  export type InvoiceUncheckedCreateInput = {
    id?: string
    tenantId: string
    clientId: string
    packageId?: string | null
    invoiceNumber: string
    status?: $Enums.InvoiceStatus
    items: JsonNullValueInput | InputJsonValue
    subtotal: number
    tax?: number
    total: number
    dueDate?: Date | string | null
    paidAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InvoiceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus
    items?: JsonNullValueInput | InputJsonValue
    subtotal?: IntFieldUpdateOperationsInput | number
    tax?: IntFieldUpdateOperationsInput | number
    total?: IntFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutInvoicesNestedInput
    client?: ClientUpdateOneRequiredWithoutInvoicesNestedInput
    package?: PackageUpdateOneWithoutInvoicesNestedInput
  }

  export type InvoiceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    packageId?: NullableStringFieldUpdateOperationsInput | string | null
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus
    items?: JsonNullValueInput | InputJsonValue
    subtotal?: IntFieldUpdateOperationsInput | number
    tax?: IntFieldUpdateOperationsInput | number
    total?: IntFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvoiceCreateManyInput = {
    id?: string
    tenantId: string
    clientId: string
    packageId?: string | null
    invoiceNumber: string
    status?: $Enums.InvoiceStatus
    items: JsonNullValueInput | InputJsonValue
    subtotal: number
    tax?: number
    total: number
    dueDate?: Date | string | null
    paidAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InvoiceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus
    items?: JsonNullValueInput | InputJsonValue
    subtotal?: IntFieldUpdateOperationsInput | number
    tax?: IntFieldUpdateOperationsInput | number
    total?: IntFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvoiceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    packageId?: NullableStringFieldUpdateOperationsInput | string | null
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus
    items?: JsonNullValueInput | InputJsonValue
    subtotal?: IntFieldUpdateOperationsInput | number
    tax?: IntFieldUpdateOperationsInput | number
    total?: IntFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type UserListRelationFilter = {
    every?: UserWhereInput
    some?: UserWhereInput
    none?: UserWhereInput
  }

  export type PackageListRelationFilter = {
    every?: PackageWhereInput
    some?: PackageWhereInput
    none?: PackageWhereInput
  }

  export type ShootListRelationFilter = {
    every?: ShootWhereInput
    some?: ShootWhereInput
    none?: ShootWhereInput
  }

  export type ShotListListRelationFilter = {
    every?: ShotListWhereInput
    some?: ShotListWhereInput
    none?: ShotListWhereInput
  }

  export type GalleryListRelationFilter = {
    every?: GalleryWhereInput
    some?: GalleryWhereInput
    none?: GalleryWhereInput
  }

  export type ClientListRelationFilter = {
    every?: ClientWhereInput
    some?: ClientWhereInput
    none?: ClientWhereInput
  }

  export type InvoiceListRelationFilter = {
    every?: InvoiceWhereInput
    some?: InvoiceWhereInput
    none?: InvoiceWhereInput
  }

  export type UserOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PackageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ShootOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ShotListOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GalleryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ClientOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InvoiceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TenantCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    plan?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    plan?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TenantMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    plan?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type TenantScalarRelationFilter = {
    is?: TenantWhereInput
    isNot?: TenantWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    tenantId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    tenantId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    tenantId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type ClientCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    type?: SortOrder
    tags?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ClientMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    type?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ClientMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    address?: SortOrder
    type?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumPackageStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PackageStatus | EnumPackageStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PackageStatus[] | ListEnumPackageStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PackageStatus[] | ListEnumPackageStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPackageStatusFilter<$PrismaModel> | $Enums.PackageStatus
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type ClientScalarRelationFilter = {
    is?: ClientWhereInput
    isNot?: ClientWhereInput
  }

  export type PackageAddonListRelationFilter = {
    every?: PackageAddonWhereInput
    some?: PackageAddonWhereInput
    none?: PackageAddonWhereInput
  }

  export type PackageAddonOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PackageCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    clientId?: SortOrder
    title?: SortOrder
    status?: SortOrder
    eventType?: SortOrder
    eventDate?: SortOrder
    shotCount?: SortOrder
    deliveryDays?: SortOrder
    galleryUrl?: SortOrder
    editingHours?: SortOrder
    styleTags?: SortOrder
    equipment?: SortOrder
    secondShooter?: SortOrder
    rawFilesIncluded?: SortOrder
    timeline?: SortOrder
    basePrice?: SortOrder
    travelCosts?: SortOrder
    totalPrice?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PackageAvgOrderByAggregateInput = {
    shotCount?: SortOrder
    deliveryDays?: SortOrder
    editingHours?: SortOrder
    basePrice?: SortOrder
    travelCosts?: SortOrder
    totalPrice?: SortOrder
  }

  export type PackageMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    clientId?: SortOrder
    title?: SortOrder
    status?: SortOrder
    eventType?: SortOrder
    eventDate?: SortOrder
    shotCount?: SortOrder
    deliveryDays?: SortOrder
    galleryUrl?: SortOrder
    editingHours?: SortOrder
    secondShooter?: SortOrder
    rawFilesIncluded?: SortOrder
    basePrice?: SortOrder
    travelCosts?: SortOrder
    totalPrice?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PackageMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    clientId?: SortOrder
    title?: SortOrder
    status?: SortOrder
    eventType?: SortOrder
    eventDate?: SortOrder
    shotCount?: SortOrder
    deliveryDays?: SortOrder
    galleryUrl?: SortOrder
    editingHours?: SortOrder
    secondShooter?: SortOrder
    rawFilesIncluded?: SortOrder
    basePrice?: SortOrder
    travelCosts?: SortOrder
    totalPrice?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PackageSumOrderByAggregateInput = {
    shotCount?: SortOrder
    deliveryDays?: SortOrder
    editingHours?: SortOrder
    basePrice?: SortOrder
    travelCosts?: SortOrder
    totalPrice?: SortOrder
  }

  export type EnumPackageStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PackageStatus | EnumPackageStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PackageStatus[] | ListEnumPackageStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PackageStatus[] | ListEnumPackageStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPackageStatusWithAggregatesFilter<$PrismaModel> | $Enums.PackageStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPackageStatusFilter<$PrismaModel>
    _max?: NestedEnumPackageStatusFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type PackageScalarRelationFilter = {
    is?: PackageWhereInput
    isNot?: PackageWhereInput
  }

  export type PackageAddonCountOrderByAggregateInput = {
    id?: SortOrder
    packageId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    createdAt?: SortOrder
  }

  export type PackageAddonAvgOrderByAggregateInput = {
    price?: SortOrder
    quantity?: SortOrder
  }

  export type PackageAddonMaxOrderByAggregateInput = {
    id?: SortOrder
    packageId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    createdAt?: SortOrder
  }

  export type PackageAddonMinOrderByAggregateInput = {
    id?: SortOrder
    packageId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    quantity?: SortOrder
    createdAt?: SortOrder
  }

  export type PackageAddonSumOrderByAggregateInput = {
    price?: SortOrder
    quantity?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }
  export type JsonNullableListFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableListFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableListFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableListFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableListFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableListFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue[] | ListJsonFieldRefInput<$PrismaModel> | null
    has?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    hasEvery?: InputJsonValue[] | ListJsonFieldRefInput<$PrismaModel>
    hasSome?: InputJsonValue[] | ListJsonFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type ShotListNullableScalarRelationFilter = {
    is?: ShotListWhereInput | null
    isNot?: ShotListWhereInput | null
  }

  export type ShootCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packageId?: SortOrder
    date?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    shotListId?: SortOrder
    timeline?: SortOrder
    locations?: SortOrder
    sunsetTime?: SortOrder
    weatherForecast?: SortOrder
    venueType?: SortOrder
    venueName?: SortOrder
    venueAddress?: SortOrder
    lightingNotes?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ShootMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packageId?: SortOrder
    date?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    shotListId?: SortOrder
    sunsetTime?: SortOrder
    venueType?: SortOrder
    venueName?: SortOrder
    venueAddress?: SortOrder
    lightingNotes?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ShootMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packageId?: SortOrder
    date?: SortOrder
    startTime?: SortOrder
    endTime?: SortOrder
    shotListId?: SortOrder
    sunsetTime?: SortOrder
    venueType?: SortOrder
    venueName?: SortOrder
    venueAddress?: SortOrder
    lightingNotes?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumShotListStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ShotListStatus | EnumShotListStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ShotListStatus[] | ListEnumShotListStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ShotListStatus[] | ListEnumShotListStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumShotListStatusFilter<$PrismaModel> | $Enums.ShotListStatus
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type PackageNullableScalarRelationFilter = {
    is?: PackageWhereInput | null
    isNot?: PackageWhereInput | null
  }

  export type ShootNullableScalarRelationFilter = {
    is?: ShootWhereInput | null
    isNot?: ShootWhereInput | null
  }

  export type ShotListCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packageId?: SortOrder
    name?: SortOrder
    status?: SortOrder
    eventType?: SortOrder
    aiGenerated?: SortOrder
    sections?: SortOrder
    totalShots?: SortOrder
    mustHaveCount?: SortOrder
    estimatedTime?: SortOrder
    equipmentList?: SortOrder
    lightingPlan?: SortOrder
    backupPlans?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ShotListAvgOrderByAggregateInput = {
    totalShots?: SortOrder
    mustHaveCount?: SortOrder
    estimatedTime?: SortOrder
  }

  export type ShotListMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packageId?: SortOrder
    name?: SortOrder
    status?: SortOrder
    eventType?: SortOrder
    aiGenerated?: SortOrder
    totalShots?: SortOrder
    mustHaveCount?: SortOrder
    estimatedTime?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ShotListMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    packageId?: SortOrder
    name?: SortOrder
    status?: SortOrder
    eventType?: SortOrder
    aiGenerated?: SortOrder
    totalShots?: SortOrder
    mustHaveCount?: SortOrder
    estimatedTime?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ShotListSumOrderByAggregateInput = {
    totalShots?: SortOrder
    mustHaveCount?: SortOrder
    estimatedTime?: SortOrder
  }

  export type EnumShotListStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ShotListStatus | EnumShotListStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ShotListStatus[] | ListEnumShotListStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ShotListStatus[] | ListEnumShotListStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumShotListStatusWithAggregatesFilter<$PrismaModel> | $Enums.ShotListStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumShotListStatusFilter<$PrismaModel>
    _max?: NestedEnumShotListStatusFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type EnumGalleryStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.GalleryStatus | EnumGalleryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.GalleryStatus[] | ListEnumGalleryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.GalleryStatus[] | ListEnumGalleryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumGalleryStatusFilter<$PrismaModel> | $Enums.GalleryStatus
  }

  export type ShootScalarRelationFilter = {
    is?: ShootWhereInput
    isNot?: ShootWhereInput
  }

  export type GalleryPhotoListRelationFilter = {
    every?: GalleryPhotoWhereInput
    some?: GalleryPhotoWhereInput
    none?: GalleryPhotoWhereInput
  }

  export type GalleryPhotoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GalleryCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    shootId?: SortOrder
    name?: SortOrder
    status?: SortOrder
    totalPhotos?: SortOrder
    selectedPhotos?: SortOrder
    aiCurated?: SortOrder
    curationData?: SortOrder
    publicUrl?: SortOrder
    password?: SortOrder
    expiresAt?: SortOrder
    downloadEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GalleryAvgOrderByAggregateInput = {
    totalPhotos?: SortOrder
    selectedPhotos?: SortOrder
  }

  export type GalleryMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    shootId?: SortOrder
    name?: SortOrder
    status?: SortOrder
    totalPhotos?: SortOrder
    selectedPhotos?: SortOrder
    aiCurated?: SortOrder
    publicUrl?: SortOrder
    password?: SortOrder
    expiresAt?: SortOrder
    downloadEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GalleryMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    shootId?: SortOrder
    name?: SortOrder
    status?: SortOrder
    totalPhotos?: SortOrder
    selectedPhotos?: SortOrder
    aiCurated?: SortOrder
    publicUrl?: SortOrder
    password?: SortOrder
    expiresAt?: SortOrder
    downloadEnabled?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GallerySumOrderByAggregateInput = {
    totalPhotos?: SortOrder
    selectedPhotos?: SortOrder
  }

  export type EnumGalleryStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.GalleryStatus | EnumGalleryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.GalleryStatus[] | ListEnumGalleryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.GalleryStatus[] | ListEnumGalleryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumGalleryStatusWithAggregatesFilter<$PrismaModel> | $Enums.GalleryStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumGalleryStatusFilter<$PrismaModel>
    _max?: NestedEnumGalleryStatusFilter<$PrismaModel>
  }

  export type GalleryScalarRelationFilter = {
    is?: GalleryWhereInput
    isNot?: GalleryWhereInput
  }

  export type GalleryPhotoCountOrderByAggregateInput = {
    id?: SortOrder
    galleryId?: SortOrder
    filename?: SortOrder
    url?: SortOrder
    thumbnailUrl?: SortOrder
    qualityScore?: SortOrder
    category?: SortOrder
    isHighlight?: SortOrder
    aiReasoning?: SortOrder
    technicalQuality?: SortOrder
    emotionalImpact?: SortOrder
    takenAt?: SortOrder
    camera?: SortOrder
    lens?: SortOrder
    settings?: SortOrder
    selected?: SortOrder
    rejected?: SortOrder
    rejectionReason?: SortOrder
    createdAt?: SortOrder
  }

  export type GalleryPhotoAvgOrderByAggregateInput = {
    qualityScore?: SortOrder
    emotionalImpact?: SortOrder
  }

  export type GalleryPhotoMaxOrderByAggregateInput = {
    id?: SortOrder
    galleryId?: SortOrder
    filename?: SortOrder
    url?: SortOrder
    thumbnailUrl?: SortOrder
    qualityScore?: SortOrder
    category?: SortOrder
    isHighlight?: SortOrder
    aiReasoning?: SortOrder
    emotionalImpact?: SortOrder
    takenAt?: SortOrder
    camera?: SortOrder
    lens?: SortOrder
    selected?: SortOrder
    rejected?: SortOrder
    rejectionReason?: SortOrder
    createdAt?: SortOrder
  }

  export type GalleryPhotoMinOrderByAggregateInput = {
    id?: SortOrder
    galleryId?: SortOrder
    filename?: SortOrder
    url?: SortOrder
    thumbnailUrl?: SortOrder
    qualityScore?: SortOrder
    category?: SortOrder
    isHighlight?: SortOrder
    aiReasoning?: SortOrder
    emotionalImpact?: SortOrder
    takenAt?: SortOrder
    camera?: SortOrder
    lens?: SortOrder
    selected?: SortOrder
    rejected?: SortOrder
    rejectionReason?: SortOrder
    createdAt?: SortOrder
  }

  export type GalleryPhotoSumOrderByAggregateInput = {
    qualityScore?: SortOrder
    emotionalImpact?: SortOrder
  }

  export type EnumInvoiceStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.InvoiceStatus | EnumInvoiceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InvoiceStatus[] | ListEnumInvoiceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InvoiceStatus[] | ListEnumInvoiceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInvoiceStatusFilter<$PrismaModel> | $Enums.InvoiceStatus
  }

  export type InvoiceCountOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    clientId?: SortOrder
    packageId?: SortOrder
    invoiceNumber?: SortOrder
    status?: SortOrder
    items?: SortOrder
    subtotal?: SortOrder
    tax?: SortOrder
    total?: SortOrder
    dueDate?: SortOrder
    paidAt?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InvoiceAvgOrderByAggregateInput = {
    subtotal?: SortOrder
    tax?: SortOrder
    total?: SortOrder
  }

  export type InvoiceMaxOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    clientId?: SortOrder
    packageId?: SortOrder
    invoiceNumber?: SortOrder
    status?: SortOrder
    subtotal?: SortOrder
    tax?: SortOrder
    total?: SortOrder
    dueDate?: SortOrder
    paidAt?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InvoiceMinOrderByAggregateInput = {
    id?: SortOrder
    tenantId?: SortOrder
    clientId?: SortOrder
    packageId?: SortOrder
    invoiceNumber?: SortOrder
    status?: SortOrder
    subtotal?: SortOrder
    tax?: SortOrder
    total?: SortOrder
    dueDate?: SortOrder
    paidAt?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InvoiceSumOrderByAggregateInput = {
    subtotal?: SortOrder
    tax?: SortOrder
    total?: SortOrder
  }

  export type EnumInvoiceStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InvoiceStatus | EnumInvoiceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InvoiceStatus[] | ListEnumInvoiceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InvoiceStatus[] | ListEnumInvoiceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInvoiceStatusWithAggregatesFilter<$PrismaModel> | $Enums.InvoiceStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInvoiceStatusFilter<$PrismaModel>
    _max?: NestedEnumInvoiceStatusFilter<$PrismaModel>
  }

  export type UserCreateNestedManyWithoutTenantInput = {
    create?: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput> | UserCreateWithoutTenantInput[] | UserUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[]
    createMany?: UserCreateManyTenantInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type PackageCreateNestedManyWithoutTenantInput = {
    create?: XOR<PackageCreateWithoutTenantInput, PackageUncheckedCreateWithoutTenantInput> | PackageCreateWithoutTenantInput[] | PackageUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: PackageCreateOrConnectWithoutTenantInput | PackageCreateOrConnectWithoutTenantInput[]
    createMany?: PackageCreateManyTenantInputEnvelope
    connect?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
  }

  export type ShootCreateNestedManyWithoutTenantInput = {
    create?: XOR<ShootCreateWithoutTenantInput, ShootUncheckedCreateWithoutTenantInput> | ShootCreateWithoutTenantInput[] | ShootUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ShootCreateOrConnectWithoutTenantInput | ShootCreateOrConnectWithoutTenantInput[]
    createMany?: ShootCreateManyTenantInputEnvelope
    connect?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
  }

  export type ShotListCreateNestedManyWithoutTenantInput = {
    create?: XOR<ShotListCreateWithoutTenantInput, ShotListUncheckedCreateWithoutTenantInput> | ShotListCreateWithoutTenantInput[] | ShotListUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ShotListCreateOrConnectWithoutTenantInput | ShotListCreateOrConnectWithoutTenantInput[]
    createMany?: ShotListCreateManyTenantInputEnvelope
    connect?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
  }

  export type GalleryCreateNestedManyWithoutTenantInput = {
    create?: XOR<GalleryCreateWithoutTenantInput, GalleryUncheckedCreateWithoutTenantInput> | GalleryCreateWithoutTenantInput[] | GalleryUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: GalleryCreateOrConnectWithoutTenantInput | GalleryCreateOrConnectWithoutTenantInput[]
    createMany?: GalleryCreateManyTenantInputEnvelope
    connect?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
  }

  export type ClientCreateNestedManyWithoutTenantInput = {
    create?: XOR<ClientCreateWithoutTenantInput, ClientUncheckedCreateWithoutTenantInput> | ClientCreateWithoutTenantInput[] | ClientUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ClientCreateOrConnectWithoutTenantInput | ClientCreateOrConnectWithoutTenantInput[]
    createMany?: ClientCreateManyTenantInputEnvelope
    connect?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
  }

  export type InvoiceCreateNestedManyWithoutTenantInput = {
    create?: XOR<InvoiceCreateWithoutTenantInput, InvoiceUncheckedCreateWithoutTenantInput> | InvoiceCreateWithoutTenantInput[] | InvoiceUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutTenantInput | InvoiceCreateOrConnectWithoutTenantInput[]
    createMany?: InvoiceCreateManyTenantInputEnvelope
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
  }

  export type UserUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput> | UserCreateWithoutTenantInput[] | UserUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[]
    createMany?: UserCreateManyTenantInputEnvelope
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
  }

  export type PackageUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<PackageCreateWithoutTenantInput, PackageUncheckedCreateWithoutTenantInput> | PackageCreateWithoutTenantInput[] | PackageUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: PackageCreateOrConnectWithoutTenantInput | PackageCreateOrConnectWithoutTenantInput[]
    createMany?: PackageCreateManyTenantInputEnvelope
    connect?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
  }

  export type ShootUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<ShootCreateWithoutTenantInput, ShootUncheckedCreateWithoutTenantInput> | ShootCreateWithoutTenantInput[] | ShootUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ShootCreateOrConnectWithoutTenantInput | ShootCreateOrConnectWithoutTenantInput[]
    createMany?: ShootCreateManyTenantInputEnvelope
    connect?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
  }

  export type ShotListUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<ShotListCreateWithoutTenantInput, ShotListUncheckedCreateWithoutTenantInput> | ShotListCreateWithoutTenantInput[] | ShotListUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ShotListCreateOrConnectWithoutTenantInput | ShotListCreateOrConnectWithoutTenantInput[]
    createMany?: ShotListCreateManyTenantInputEnvelope
    connect?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
  }

  export type GalleryUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<GalleryCreateWithoutTenantInput, GalleryUncheckedCreateWithoutTenantInput> | GalleryCreateWithoutTenantInput[] | GalleryUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: GalleryCreateOrConnectWithoutTenantInput | GalleryCreateOrConnectWithoutTenantInput[]
    createMany?: GalleryCreateManyTenantInputEnvelope
    connect?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
  }

  export type ClientUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<ClientCreateWithoutTenantInput, ClientUncheckedCreateWithoutTenantInput> | ClientCreateWithoutTenantInput[] | ClientUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ClientCreateOrConnectWithoutTenantInput | ClientCreateOrConnectWithoutTenantInput[]
    createMany?: ClientCreateManyTenantInputEnvelope
    connect?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
  }

  export type InvoiceUncheckedCreateNestedManyWithoutTenantInput = {
    create?: XOR<InvoiceCreateWithoutTenantInput, InvoiceUncheckedCreateWithoutTenantInput> | InvoiceCreateWithoutTenantInput[] | InvoiceUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutTenantInput | InvoiceCreateOrConnectWithoutTenantInput[]
    createMany?: InvoiceCreateManyTenantInputEnvelope
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserUpdateManyWithoutTenantNestedInput = {
    create?: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput> | UserCreateWithoutTenantInput[] | UserUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutTenantInput | UserUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: UserCreateManyTenantInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutTenantInput | UserUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: UserUpdateManyWithWhereWithoutTenantInput | UserUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type PackageUpdateManyWithoutTenantNestedInput = {
    create?: XOR<PackageCreateWithoutTenantInput, PackageUncheckedCreateWithoutTenantInput> | PackageCreateWithoutTenantInput[] | PackageUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: PackageCreateOrConnectWithoutTenantInput | PackageCreateOrConnectWithoutTenantInput[]
    upsert?: PackageUpsertWithWhereUniqueWithoutTenantInput | PackageUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: PackageCreateManyTenantInputEnvelope
    set?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
    disconnect?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
    delete?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
    connect?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
    update?: PackageUpdateWithWhereUniqueWithoutTenantInput | PackageUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: PackageUpdateManyWithWhereWithoutTenantInput | PackageUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: PackageScalarWhereInput | PackageScalarWhereInput[]
  }

  export type ShootUpdateManyWithoutTenantNestedInput = {
    create?: XOR<ShootCreateWithoutTenantInput, ShootUncheckedCreateWithoutTenantInput> | ShootCreateWithoutTenantInput[] | ShootUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ShootCreateOrConnectWithoutTenantInput | ShootCreateOrConnectWithoutTenantInput[]
    upsert?: ShootUpsertWithWhereUniqueWithoutTenantInput | ShootUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: ShootCreateManyTenantInputEnvelope
    set?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
    disconnect?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
    delete?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
    connect?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
    update?: ShootUpdateWithWhereUniqueWithoutTenantInput | ShootUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: ShootUpdateManyWithWhereWithoutTenantInput | ShootUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: ShootScalarWhereInput | ShootScalarWhereInput[]
  }

  export type ShotListUpdateManyWithoutTenantNestedInput = {
    create?: XOR<ShotListCreateWithoutTenantInput, ShotListUncheckedCreateWithoutTenantInput> | ShotListCreateWithoutTenantInput[] | ShotListUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ShotListCreateOrConnectWithoutTenantInput | ShotListCreateOrConnectWithoutTenantInput[]
    upsert?: ShotListUpsertWithWhereUniqueWithoutTenantInput | ShotListUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: ShotListCreateManyTenantInputEnvelope
    set?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
    disconnect?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
    delete?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
    connect?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
    update?: ShotListUpdateWithWhereUniqueWithoutTenantInput | ShotListUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: ShotListUpdateManyWithWhereWithoutTenantInput | ShotListUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: ShotListScalarWhereInput | ShotListScalarWhereInput[]
  }

  export type GalleryUpdateManyWithoutTenantNestedInput = {
    create?: XOR<GalleryCreateWithoutTenantInput, GalleryUncheckedCreateWithoutTenantInput> | GalleryCreateWithoutTenantInput[] | GalleryUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: GalleryCreateOrConnectWithoutTenantInput | GalleryCreateOrConnectWithoutTenantInput[]
    upsert?: GalleryUpsertWithWhereUniqueWithoutTenantInput | GalleryUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: GalleryCreateManyTenantInputEnvelope
    set?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
    disconnect?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
    delete?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
    connect?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
    update?: GalleryUpdateWithWhereUniqueWithoutTenantInput | GalleryUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: GalleryUpdateManyWithWhereWithoutTenantInput | GalleryUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: GalleryScalarWhereInput | GalleryScalarWhereInput[]
  }

  export type ClientUpdateManyWithoutTenantNestedInput = {
    create?: XOR<ClientCreateWithoutTenantInput, ClientUncheckedCreateWithoutTenantInput> | ClientCreateWithoutTenantInput[] | ClientUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ClientCreateOrConnectWithoutTenantInput | ClientCreateOrConnectWithoutTenantInput[]
    upsert?: ClientUpsertWithWhereUniqueWithoutTenantInput | ClientUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: ClientCreateManyTenantInputEnvelope
    set?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
    disconnect?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
    delete?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
    connect?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
    update?: ClientUpdateWithWhereUniqueWithoutTenantInput | ClientUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: ClientUpdateManyWithWhereWithoutTenantInput | ClientUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: ClientScalarWhereInput | ClientScalarWhereInput[]
  }

  export type InvoiceUpdateManyWithoutTenantNestedInput = {
    create?: XOR<InvoiceCreateWithoutTenantInput, InvoiceUncheckedCreateWithoutTenantInput> | InvoiceCreateWithoutTenantInput[] | InvoiceUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutTenantInput | InvoiceCreateOrConnectWithoutTenantInput[]
    upsert?: InvoiceUpsertWithWhereUniqueWithoutTenantInput | InvoiceUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: InvoiceCreateManyTenantInputEnvelope
    set?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    disconnect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    delete?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    update?: InvoiceUpdateWithWhereUniqueWithoutTenantInput | InvoiceUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: InvoiceUpdateManyWithWhereWithoutTenantInput | InvoiceUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: InvoiceScalarWhereInput | InvoiceScalarWhereInput[]
  }

  export type UserUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput> | UserCreateWithoutTenantInput[] | UserUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: UserCreateOrConnectWithoutTenantInput | UserCreateOrConnectWithoutTenantInput[]
    upsert?: UserUpsertWithWhereUniqueWithoutTenantInput | UserUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: UserCreateManyTenantInputEnvelope
    set?: UserWhereUniqueInput | UserWhereUniqueInput[]
    disconnect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    delete?: UserWhereUniqueInput | UserWhereUniqueInput[]
    connect?: UserWhereUniqueInput | UserWhereUniqueInput[]
    update?: UserUpdateWithWhereUniqueWithoutTenantInput | UserUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: UserUpdateManyWithWhereWithoutTenantInput | UserUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: UserScalarWhereInput | UserScalarWhereInput[]
  }

  export type PackageUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<PackageCreateWithoutTenantInput, PackageUncheckedCreateWithoutTenantInput> | PackageCreateWithoutTenantInput[] | PackageUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: PackageCreateOrConnectWithoutTenantInput | PackageCreateOrConnectWithoutTenantInput[]
    upsert?: PackageUpsertWithWhereUniqueWithoutTenantInput | PackageUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: PackageCreateManyTenantInputEnvelope
    set?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
    disconnect?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
    delete?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
    connect?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
    update?: PackageUpdateWithWhereUniqueWithoutTenantInput | PackageUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: PackageUpdateManyWithWhereWithoutTenantInput | PackageUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: PackageScalarWhereInput | PackageScalarWhereInput[]
  }

  export type ShootUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<ShootCreateWithoutTenantInput, ShootUncheckedCreateWithoutTenantInput> | ShootCreateWithoutTenantInput[] | ShootUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ShootCreateOrConnectWithoutTenantInput | ShootCreateOrConnectWithoutTenantInput[]
    upsert?: ShootUpsertWithWhereUniqueWithoutTenantInput | ShootUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: ShootCreateManyTenantInputEnvelope
    set?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
    disconnect?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
    delete?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
    connect?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
    update?: ShootUpdateWithWhereUniqueWithoutTenantInput | ShootUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: ShootUpdateManyWithWhereWithoutTenantInput | ShootUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: ShootScalarWhereInput | ShootScalarWhereInput[]
  }

  export type ShotListUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<ShotListCreateWithoutTenantInput, ShotListUncheckedCreateWithoutTenantInput> | ShotListCreateWithoutTenantInput[] | ShotListUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ShotListCreateOrConnectWithoutTenantInput | ShotListCreateOrConnectWithoutTenantInput[]
    upsert?: ShotListUpsertWithWhereUniqueWithoutTenantInput | ShotListUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: ShotListCreateManyTenantInputEnvelope
    set?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
    disconnect?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
    delete?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
    connect?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
    update?: ShotListUpdateWithWhereUniqueWithoutTenantInput | ShotListUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: ShotListUpdateManyWithWhereWithoutTenantInput | ShotListUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: ShotListScalarWhereInput | ShotListScalarWhereInput[]
  }

  export type GalleryUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<GalleryCreateWithoutTenantInput, GalleryUncheckedCreateWithoutTenantInput> | GalleryCreateWithoutTenantInput[] | GalleryUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: GalleryCreateOrConnectWithoutTenantInput | GalleryCreateOrConnectWithoutTenantInput[]
    upsert?: GalleryUpsertWithWhereUniqueWithoutTenantInput | GalleryUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: GalleryCreateManyTenantInputEnvelope
    set?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
    disconnect?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
    delete?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
    connect?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
    update?: GalleryUpdateWithWhereUniqueWithoutTenantInput | GalleryUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: GalleryUpdateManyWithWhereWithoutTenantInput | GalleryUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: GalleryScalarWhereInput | GalleryScalarWhereInput[]
  }

  export type ClientUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<ClientCreateWithoutTenantInput, ClientUncheckedCreateWithoutTenantInput> | ClientCreateWithoutTenantInput[] | ClientUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: ClientCreateOrConnectWithoutTenantInput | ClientCreateOrConnectWithoutTenantInput[]
    upsert?: ClientUpsertWithWhereUniqueWithoutTenantInput | ClientUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: ClientCreateManyTenantInputEnvelope
    set?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
    disconnect?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
    delete?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
    connect?: ClientWhereUniqueInput | ClientWhereUniqueInput[]
    update?: ClientUpdateWithWhereUniqueWithoutTenantInput | ClientUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: ClientUpdateManyWithWhereWithoutTenantInput | ClientUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: ClientScalarWhereInput | ClientScalarWhereInput[]
  }

  export type InvoiceUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: XOR<InvoiceCreateWithoutTenantInput, InvoiceUncheckedCreateWithoutTenantInput> | InvoiceCreateWithoutTenantInput[] | InvoiceUncheckedCreateWithoutTenantInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutTenantInput | InvoiceCreateOrConnectWithoutTenantInput[]
    upsert?: InvoiceUpsertWithWhereUniqueWithoutTenantInput | InvoiceUpsertWithWhereUniqueWithoutTenantInput[]
    createMany?: InvoiceCreateManyTenantInputEnvelope
    set?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    disconnect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    delete?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    update?: InvoiceUpdateWithWhereUniqueWithoutTenantInput | InvoiceUpdateWithWhereUniqueWithoutTenantInput[]
    updateMany?: InvoiceUpdateManyWithWhereWithoutTenantInput | InvoiceUpdateManyWithWhereWithoutTenantInput[]
    deleteMany?: InvoiceScalarWhereInput | InvoiceScalarWhereInput[]
  }

  export type TenantCreateNestedOneWithoutUsersInput = {
    create?: XOR<TenantCreateWithoutUsersInput, TenantUncheckedCreateWithoutUsersInput>
    connectOrCreate?: TenantCreateOrConnectWithoutUsersInput
    connect?: TenantWhereUniqueInput
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type TenantUpdateOneRequiredWithoutUsersNestedInput = {
    create?: XOR<TenantCreateWithoutUsersInput, TenantUncheckedCreateWithoutUsersInput>
    connectOrCreate?: TenantCreateOrConnectWithoutUsersInput
    upsert?: TenantUpsertWithoutUsersInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutUsersInput, TenantUpdateWithoutUsersInput>, TenantUncheckedUpdateWithoutUsersInput>
  }

  export type ClientCreatetagsInput = {
    set: string[]
  }

  export type TenantCreateNestedOneWithoutClientsInput = {
    create?: XOR<TenantCreateWithoutClientsInput, TenantUncheckedCreateWithoutClientsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutClientsInput
    connect?: TenantWhereUniqueInput
  }

  export type PackageCreateNestedManyWithoutClientInput = {
    create?: XOR<PackageCreateWithoutClientInput, PackageUncheckedCreateWithoutClientInput> | PackageCreateWithoutClientInput[] | PackageUncheckedCreateWithoutClientInput[]
    connectOrCreate?: PackageCreateOrConnectWithoutClientInput | PackageCreateOrConnectWithoutClientInput[]
    createMany?: PackageCreateManyClientInputEnvelope
    connect?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
  }

  export type InvoiceCreateNestedManyWithoutClientInput = {
    create?: XOR<InvoiceCreateWithoutClientInput, InvoiceUncheckedCreateWithoutClientInput> | InvoiceCreateWithoutClientInput[] | InvoiceUncheckedCreateWithoutClientInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutClientInput | InvoiceCreateOrConnectWithoutClientInput[]
    createMany?: InvoiceCreateManyClientInputEnvelope
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
  }

  export type PackageUncheckedCreateNestedManyWithoutClientInput = {
    create?: XOR<PackageCreateWithoutClientInput, PackageUncheckedCreateWithoutClientInput> | PackageCreateWithoutClientInput[] | PackageUncheckedCreateWithoutClientInput[]
    connectOrCreate?: PackageCreateOrConnectWithoutClientInput | PackageCreateOrConnectWithoutClientInput[]
    createMany?: PackageCreateManyClientInputEnvelope
    connect?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
  }

  export type InvoiceUncheckedCreateNestedManyWithoutClientInput = {
    create?: XOR<InvoiceCreateWithoutClientInput, InvoiceUncheckedCreateWithoutClientInput> | InvoiceCreateWithoutClientInput[] | InvoiceUncheckedCreateWithoutClientInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutClientInput | InvoiceCreateOrConnectWithoutClientInput[]
    createMany?: InvoiceCreateManyClientInputEnvelope
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
  }

  export type ClientUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type TenantUpdateOneRequiredWithoutClientsNestedInput = {
    create?: XOR<TenantCreateWithoutClientsInput, TenantUncheckedCreateWithoutClientsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutClientsInput
    upsert?: TenantUpsertWithoutClientsInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutClientsInput, TenantUpdateWithoutClientsInput>, TenantUncheckedUpdateWithoutClientsInput>
  }

  export type PackageUpdateManyWithoutClientNestedInput = {
    create?: XOR<PackageCreateWithoutClientInput, PackageUncheckedCreateWithoutClientInput> | PackageCreateWithoutClientInput[] | PackageUncheckedCreateWithoutClientInput[]
    connectOrCreate?: PackageCreateOrConnectWithoutClientInput | PackageCreateOrConnectWithoutClientInput[]
    upsert?: PackageUpsertWithWhereUniqueWithoutClientInput | PackageUpsertWithWhereUniqueWithoutClientInput[]
    createMany?: PackageCreateManyClientInputEnvelope
    set?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
    disconnect?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
    delete?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
    connect?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
    update?: PackageUpdateWithWhereUniqueWithoutClientInput | PackageUpdateWithWhereUniqueWithoutClientInput[]
    updateMany?: PackageUpdateManyWithWhereWithoutClientInput | PackageUpdateManyWithWhereWithoutClientInput[]
    deleteMany?: PackageScalarWhereInput | PackageScalarWhereInput[]
  }

  export type InvoiceUpdateManyWithoutClientNestedInput = {
    create?: XOR<InvoiceCreateWithoutClientInput, InvoiceUncheckedCreateWithoutClientInput> | InvoiceCreateWithoutClientInput[] | InvoiceUncheckedCreateWithoutClientInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutClientInput | InvoiceCreateOrConnectWithoutClientInput[]
    upsert?: InvoiceUpsertWithWhereUniqueWithoutClientInput | InvoiceUpsertWithWhereUniqueWithoutClientInput[]
    createMany?: InvoiceCreateManyClientInputEnvelope
    set?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    disconnect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    delete?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    update?: InvoiceUpdateWithWhereUniqueWithoutClientInput | InvoiceUpdateWithWhereUniqueWithoutClientInput[]
    updateMany?: InvoiceUpdateManyWithWhereWithoutClientInput | InvoiceUpdateManyWithWhereWithoutClientInput[]
    deleteMany?: InvoiceScalarWhereInput | InvoiceScalarWhereInput[]
  }

  export type PackageUncheckedUpdateManyWithoutClientNestedInput = {
    create?: XOR<PackageCreateWithoutClientInput, PackageUncheckedCreateWithoutClientInput> | PackageCreateWithoutClientInput[] | PackageUncheckedCreateWithoutClientInput[]
    connectOrCreate?: PackageCreateOrConnectWithoutClientInput | PackageCreateOrConnectWithoutClientInput[]
    upsert?: PackageUpsertWithWhereUniqueWithoutClientInput | PackageUpsertWithWhereUniqueWithoutClientInput[]
    createMany?: PackageCreateManyClientInputEnvelope
    set?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
    disconnect?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
    delete?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
    connect?: PackageWhereUniqueInput | PackageWhereUniqueInput[]
    update?: PackageUpdateWithWhereUniqueWithoutClientInput | PackageUpdateWithWhereUniqueWithoutClientInput[]
    updateMany?: PackageUpdateManyWithWhereWithoutClientInput | PackageUpdateManyWithWhereWithoutClientInput[]
    deleteMany?: PackageScalarWhereInput | PackageScalarWhereInput[]
  }

  export type InvoiceUncheckedUpdateManyWithoutClientNestedInput = {
    create?: XOR<InvoiceCreateWithoutClientInput, InvoiceUncheckedCreateWithoutClientInput> | InvoiceCreateWithoutClientInput[] | InvoiceUncheckedCreateWithoutClientInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutClientInput | InvoiceCreateOrConnectWithoutClientInput[]
    upsert?: InvoiceUpsertWithWhereUniqueWithoutClientInput | InvoiceUpsertWithWhereUniqueWithoutClientInput[]
    createMany?: InvoiceCreateManyClientInputEnvelope
    set?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    disconnect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    delete?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    update?: InvoiceUpdateWithWhereUniqueWithoutClientInput | InvoiceUpdateWithWhereUniqueWithoutClientInput[]
    updateMany?: InvoiceUpdateManyWithWhereWithoutClientInput | InvoiceUpdateManyWithWhereWithoutClientInput[]
    deleteMany?: InvoiceScalarWhereInput | InvoiceScalarWhereInput[]
  }

  export type PackageCreatestyleTagsInput = {
    set: string[]
  }

  export type PackageCreateequipmentInput = {
    set: string[]
  }

  export type TenantCreateNestedOneWithoutPackagesInput = {
    create?: XOR<TenantCreateWithoutPackagesInput, TenantUncheckedCreateWithoutPackagesInput>
    connectOrCreate?: TenantCreateOrConnectWithoutPackagesInput
    connect?: TenantWhereUniqueInput
  }

  export type ClientCreateNestedOneWithoutPackagesInput = {
    create?: XOR<ClientCreateWithoutPackagesInput, ClientUncheckedCreateWithoutPackagesInput>
    connectOrCreate?: ClientCreateOrConnectWithoutPackagesInput
    connect?: ClientWhereUniqueInput
  }

  export type ShootCreateNestedManyWithoutPackageInput = {
    create?: XOR<ShootCreateWithoutPackageInput, ShootUncheckedCreateWithoutPackageInput> | ShootCreateWithoutPackageInput[] | ShootUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: ShootCreateOrConnectWithoutPackageInput | ShootCreateOrConnectWithoutPackageInput[]
    createMany?: ShootCreateManyPackageInputEnvelope
    connect?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
  }

  export type PackageAddonCreateNestedManyWithoutPackageInput = {
    create?: XOR<PackageAddonCreateWithoutPackageInput, PackageAddonUncheckedCreateWithoutPackageInput> | PackageAddonCreateWithoutPackageInput[] | PackageAddonUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: PackageAddonCreateOrConnectWithoutPackageInput | PackageAddonCreateOrConnectWithoutPackageInput[]
    createMany?: PackageAddonCreateManyPackageInputEnvelope
    connect?: PackageAddonWhereUniqueInput | PackageAddonWhereUniqueInput[]
  }

  export type InvoiceCreateNestedManyWithoutPackageInput = {
    create?: XOR<InvoiceCreateWithoutPackageInput, InvoiceUncheckedCreateWithoutPackageInput> | InvoiceCreateWithoutPackageInput[] | InvoiceUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutPackageInput | InvoiceCreateOrConnectWithoutPackageInput[]
    createMany?: InvoiceCreateManyPackageInputEnvelope
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
  }

  export type ShotListCreateNestedManyWithoutPackageInput = {
    create?: XOR<ShotListCreateWithoutPackageInput, ShotListUncheckedCreateWithoutPackageInput> | ShotListCreateWithoutPackageInput[] | ShotListUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: ShotListCreateOrConnectWithoutPackageInput | ShotListCreateOrConnectWithoutPackageInput[]
    createMany?: ShotListCreateManyPackageInputEnvelope
    connect?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
  }

  export type ShootUncheckedCreateNestedManyWithoutPackageInput = {
    create?: XOR<ShootCreateWithoutPackageInput, ShootUncheckedCreateWithoutPackageInput> | ShootCreateWithoutPackageInput[] | ShootUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: ShootCreateOrConnectWithoutPackageInput | ShootCreateOrConnectWithoutPackageInput[]
    createMany?: ShootCreateManyPackageInputEnvelope
    connect?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
  }

  export type PackageAddonUncheckedCreateNestedManyWithoutPackageInput = {
    create?: XOR<PackageAddonCreateWithoutPackageInput, PackageAddonUncheckedCreateWithoutPackageInput> | PackageAddonCreateWithoutPackageInput[] | PackageAddonUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: PackageAddonCreateOrConnectWithoutPackageInput | PackageAddonCreateOrConnectWithoutPackageInput[]
    createMany?: PackageAddonCreateManyPackageInputEnvelope
    connect?: PackageAddonWhereUniqueInput | PackageAddonWhereUniqueInput[]
  }

  export type InvoiceUncheckedCreateNestedManyWithoutPackageInput = {
    create?: XOR<InvoiceCreateWithoutPackageInput, InvoiceUncheckedCreateWithoutPackageInput> | InvoiceCreateWithoutPackageInput[] | InvoiceUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutPackageInput | InvoiceCreateOrConnectWithoutPackageInput[]
    createMany?: InvoiceCreateManyPackageInputEnvelope
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
  }

  export type ShotListUncheckedCreateNestedManyWithoutPackageInput = {
    create?: XOR<ShotListCreateWithoutPackageInput, ShotListUncheckedCreateWithoutPackageInput> | ShotListCreateWithoutPackageInput[] | ShotListUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: ShotListCreateOrConnectWithoutPackageInput | ShotListCreateOrConnectWithoutPackageInput[]
    createMany?: ShotListCreateManyPackageInputEnvelope
    connect?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
  }

  export type EnumPackageStatusFieldUpdateOperationsInput = {
    set?: $Enums.PackageStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type PackageUpdatestyleTagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type PackageUpdateequipmentInput = {
    set?: string[]
    push?: string | string[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type TenantUpdateOneRequiredWithoutPackagesNestedInput = {
    create?: XOR<TenantCreateWithoutPackagesInput, TenantUncheckedCreateWithoutPackagesInput>
    connectOrCreate?: TenantCreateOrConnectWithoutPackagesInput
    upsert?: TenantUpsertWithoutPackagesInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutPackagesInput, TenantUpdateWithoutPackagesInput>, TenantUncheckedUpdateWithoutPackagesInput>
  }

  export type ClientUpdateOneRequiredWithoutPackagesNestedInput = {
    create?: XOR<ClientCreateWithoutPackagesInput, ClientUncheckedCreateWithoutPackagesInput>
    connectOrCreate?: ClientCreateOrConnectWithoutPackagesInput
    upsert?: ClientUpsertWithoutPackagesInput
    connect?: ClientWhereUniqueInput
    update?: XOR<XOR<ClientUpdateToOneWithWhereWithoutPackagesInput, ClientUpdateWithoutPackagesInput>, ClientUncheckedUpdateWithoutPackagesInput>
  }

  export type ShootUpdateManyWithoutPackageNestedInput = {
    create?: XOR<ShootCreateWithoutPackageInput, ShootUncheckedCreateWithoutPackageInput> | ShootCreateWithoutPackageInput[] | ShootUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: ShootCreateOrConnectWithoutPackageInput | ShootCreateOrConnectWithoutPackageInput[]
    upsert?: ShootUpsertWithWhereUniqueWithoutPackageInput | ShootUpsertWithWhereUniqueWithoutPackageInput[]
    createMany?: ShootCreateManyPackageInputEnvelope
    set?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
    disconnect?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
    delete?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
    connect?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
    update?: ShootUpdateWithWhereUniqueWithoutPackageInput | ShootUpdateWithWhereUniqueWithoutPackageInput[]
    updateMany?: ShootUpdateManyWithWhereWithoutPackageInput | ShootUpdateManyWithWhereWithoutPackageInput[]
    deleteMany?: ShootScalarWhereInput | ShootScalarWhereInput[]
  }

  export type PackageAddonUpdateManyWithoutPackageNestedInput = {
    create?: XOR<PackageAddonCreateWithoutPackageInput, PackageAddonUncheckedCreateWithoutPackageInput> | PackageAddonCreateWithoutPackageInput[] | PackageAddonUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: PackageAddonCreateOrConnectWithoutPackageInput | PackageAddonCreateOrConnectWithoutPackageInput[]
    upsert?: PackageAddonUpsertWithWhereUniqueWithoutPackageInput | PackageAddonUpsertWithWhereUniqueWithoutPackageInput[]
    createMany?: PackageAddonCreateManyPackageInputEnvelope
    set?: PackageAddonWhereUniqueInput | PackageAddonWhereUniqueInput[]
    disconnect?: PackageAddonWhereUniqueInput | PackageAddonWhereUniqueInput[]
    delete?: PackageAddonWhereUniqueInput | PackageAddonWhereUniqueInput[]
    connect?: PackageAddonWhereUniqueInput | PackageAddonWhereUniqueInput[]
    update?: PackageAddonUpdateWithWhereUniqueWithoutPackageInput | PackageAddonUpdateWithWhereUniqueWithoutPackageInput[]
    updateMany?: PackageAddonUpdateManyWithWhereWithoutPackageInput | PackageAddonUpdateManyWithWhereWithoutPackageInput[]
    deleteMany?: PackageAddonScalarWhereInput | PackageAddonScalarWhereInput[]
  }

  export type InvoiceUpdateManyWithoutPackageNestedInput = {
    create?: XOR<InvoiceCreateWithoutPackageInput, InvoiceUncheckedCreateWithoutPackageInput> | InvoiceCreateWithoutPackageInput[] | InvoiceUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutPackageInput | InvoiceCreateOrConnectWithoutPackageInput[]
    upsert?: InvoiceUpsertWithWhereUniqueWithoutPackageInput | InvoiceUpsertWithWhereUniqueWithoutPackageInput[]
    createMany?: InvoiceCreateManyPackageInputEnvelope
    set?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    disconnect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    delete?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    update?: InvoiceUpdateWithWhereUniqueWithoutPackageInput | InvoiceUpdateWithWhereUniqueWithoutPackageInput[]
    updateMany?: InvoiceUpdateManyWithWhereWithoutPackageInput | InvoiceUpdateManyWithWhereWithoutPackageInput[]
    deleteMany?: InvoiceScalarWhereInput | InvoiceScalarWhereInput[]
  }

  export type ShotListUpdateManyWithoutPackageNestedInput = {
    create?: XOR<ShotListCreateWithoutPackageInput, ShotListUncheckedCreateWithoutPackageInput> | ShotListCreateWithoutPackageInput[] | ShotListUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: ShotListCreateOrConnectWithoutPackageInput | ShotListCreateOrConnectWithoutPackageInput[]
    upsert?: ShotListUpsertWithWhereUniqueWithoutPackageInput | ShotListUpsertWithWhereUniqueWithoutPackageInput[]
    createMany?: ShotListCreateManyPackageInputEnvelope
    set?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
    disconnect?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
    delete?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
    connect?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
    update?: ShotListUpdateWithWhereUniqueWithoutPackageInput | ShotListUpdateWithWhereUniqueWithoutPackageInput[]
    updateMany?: ShotListUpdateManyWithWhereWithoutPackageInput | ShotListUpdateManyWithWhereWithoutPackageInput[]
    deleteMany?: ShotListScalarWhereInput | ShotListScalarWhereInput[]
  }

  export type ShootUncheckedUpdateManyWithoutPackageNestedInput = {
    create?: XOR<ShootCreateWithoutPackageInput, ShootUncheckedCreateWithoutPackageInput> | ShootCreateWithoutPackageInput[] | ShootUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: ShootCreateOrConnectWithoutPackageInput | ShootCreateOrConnectWithoutPackageInput[]
    upsert?: ShootUpsertWithWhereUniqueWithoutPackageInput | ShootUpsertWithWhereUniqueWithoutPackageInput[]
    createMany?: ShootCreateManyPackageInputEnvelope
    set?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
    disconnect?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
    delete?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
    connect?: ShootWhereUniqueInput | ShootWhereUniqueInput[]
    update?: ShootUpdateWithWhereUniqueWithoutPackageInput | ShootUpdateWithWhereUniqueWithoutPackageInput[]
    updateMany?: ShootUpdateManyWithWhereWithoutPackageInput | ShootUpdateManyWithWhereWithoutPackageInput[]
    deleteMany?: ShootScalarWhereInput | ShootScalarWhereInput[]
  }

  export type PackageAddonUncheckedUpdateManyWithoutPackageNestedInput = {
    create?: XOR<PackageAddonCreateWithoutPackageInput, PackageAddonUncheckedCreateWithoutPackageInput> | PackageAddonCreateWithoutPackageInput[] | PackageAddonUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: PackageAddonCreateOrConnectWithoutPackageInput | PackageAddonCreateOrConnectWithoutPackageInput[]
    upsert?: PackageAddonUpsertWithWhereUniqueWithoutPackageInput | PackageAddonUpsertWithWhereUniqueWithoutPackageInput[]
    createMany?: PackageAddonCreateManyPackageInputEnvelope
    set?: PackageAddonWhereUniqueInput | PackageAddonWhereUniqueInput[]
    disconnect?: PackageAddonWhereUniqueInput | PackageAddonWhereUniqueInput[]
    delete?: PackageAddonWhereUniqueInput | PackageAddonWhereUniqueInput[]
    connect?: PackageAddonWhereUniqueInput | PackageAddonWhereUniqueInput[]
    update?: PackageAddonUpdateWithWhereUniqueWithoutPackageInput | PackageAddonUpdateWithWhereUniqueWithoutPackageInput[]
    updateMany?: PackageAddonUpdateManyWithWhereWithoutPackageInput | PackageAddonUpdateManyWithWhereWithoutPackageInput[]
    deleteMany?: PackageAddonScalarWhereInput | PackageAddonScalarWhereInput[]
  }

  export type InvoiceUncheckedUpdateManyWithoutPackageNestedInput = {
    create?: XOR<InvoiceCreateWithoutPackageInput, InvoiceUncheckedCreateWithoutPackageInput> | InvoiceCreateWithoutPackageInput[] | InvoiceUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: InvoiceCreateOrConnectWithoutPackageInput | InvoiceCreateOrConnectWithoutPackageInput[]
    upsert?: InvoiceUpsertWithWhereUniqueWithoutPackageInput | InvoiceUpsertWithWhereUniqueWithoutPackageInput[]
    createMany?: InvoiceCreateManyPackageInputEnvelope
    set?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    disconnect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    delete?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    connect?: InvoiceWhereUniqueInput | InvoiceWhereUniqueInput[]
    update?: InvoiceUpdateWithWhereUniqueWithoutPackageInput | InvoiceUpdateWithWhereUniqueWithoutPackageInput[]
    updateMany?: InvoiceUpdateManyWithWhereWithoutPackageInput | InvoiceUpdateManyWithWhereWithoutPackageInput[]
    deleteMany?: InvoiceScalarWhereInput | InvoiceScalarWhereInput[]
  }

  export type ShotListUncheckedUpdateManyWithoutPackageNestedInput = {
    create?: XOR<ShotListCreateWithoutPackageInput, ShotListUncheckedCreateWithoutPackageInput> | ShotListCreateWithoutPackageInput[] | ShotListUncheckedCreateWithoutPackageInput[]
    connectOrCreate?: ShotListCreateOrConnectWithoutPackageInput | ShotListCreateOrConnectWithoutPackageInput[]
    upsert?: ShotListUpsertWithWhereUniqueWithoutPackageInput | ShotListUpsertWithWhereUniqueWithoutPackageInput[]
    createMany?: ShotListCreateManyPackageInputEnvelope
    set?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
    disconnect?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
    delete?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
    connect?: ShotListWhereUniqueInput | ShotListWhereUniqueInput[]
    update?: ShotListUpdateWithWhereUniqueWithoutPackageInput | ShotListUpdateWithWhereUniqueWithoutPackageInput[]
    updateMany?: ShotListUpdateManyWithWhereWithoutPackageInput | ShotListUpdateManyWithWhereWithoutPackageInput[]
    deleteMany?: ShotListScalarWhereInput | ShotListScalarWhereInput[]
  }

  export type PackageCreateNestedOneWithoutAddonsInput = {
    create?: XOR<PackageCreateWithoutAddonsInput, PackageUncheckedCreateWithoutAddonsInput>
    connectOrCreate?: PackageCreateOrConnectWithoutAddonsInput
    connect?: PackageWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type PackageUpdateOneRequiredWithoutAddonsNestedInput = {
    create?: XOR<PackageCreateWithoutAddonsInput, PackageUncheckedCreateWithoutAddonsInput>
    connectOrCreate?: PackageCreateOrConnectWithoutAddonsInput
    upsert?: PackageUpsertWithoutAddonsInput
    connect?: PackageWhereUniqueInput
    update?: XOR<XOR<PackageUpdateToOneWithWhereWithoutAddonsInput, PackageUpdateWithoutAddonsInput>, PackageUncheckedUpdateWithoutAddonsInput>
  }

  export type ShootCreatelocationsInput = {
    set: InputJsonValue[]
  }

  export type TenantCreateNestedOneWithoutShootsInput = {
    create?: XOR<TenantCreateWithoutShootsInput, TenantUncheckedCreateWithoutShootsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutShootsInput
    connect?: TenantWhereUniqueInput
  }

  export type PackageCreateNestedOneWithoutShootsInput = {
    create?: XOR<PackageCreateWithoutShootsInput, PackageUncheckedCreateWithoutShootsInput>
    connectOrCreate?: PackageCreateOrConnectWithoutShootsInput
    connect?: PackageWhereUniqueInput
  }

  export type ShotListCreateNestedOneWithoutShootInput = {
    create?: XOR<ShotListCreateWithoutShootInput, ShotListUncheckedCreateWithoutShootInput>
    connectOrCreate?: ShotListCreateOrConnectWithoutShootInput
    connect?: ShotListWhereUniqueInput
  }

  export type GalleryCreateNestedManyWithoutShootInput = {
    create?: XOR<GalleryCreateWithoutShootInput, GalleryUncheckedCreateWithoutShootInput> | GalleryCreateWithoutShootInput[] | GalleryUncheckedCreateWithoutShootInput[]
    connectOrCreate?: GalleryCreateOrConnectWithoutShootInput | GalleryCreateOrConnectWithoutShootInput[]
    createMany?: GalleryCreateManyShootInputEnvelope
    connect?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
  }

  export type GalleryUncheckedCreateNestedManyWithoutShootInput = {
    create?: XOR<GalleryCreateWithoutShootInput, GalleryUncheckedCreateWithoutShootInput> | GalleryCreateWithoutShootInput[] | GalleryUncheckedCreateWithoutShootInput[]
    connectOrCreate?: GalleryCreateOrConnectWithoutShootInput | GalleryCreateOrConnectWithoutShootInput[]
    createMany?: GalleryCreateManyShootInputEnvelope
    connect?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
  }

  export type ShootUpdatelocationsInput = {
    set?: InputJsonValue[]
    push?: InputJsonValue | InputJsonValue[]
  }

  export type TenantUpdateOneRequiredWithoutShootsNestedInput = {
    create?: XOR<TenantCreateWithoutShootsInput, TenantUncheckedCreateWithoutShootsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutShootsInput
    upsert?: TenantUpsertWithoutShootsInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutShootsInput, TenantUpdateWithoutShootsInput>, TenantUncheckedUpdateWithoutShootsInput>
  }

  export type PackageUpdateOneRequiredWithoutShootsNestedInput = {
    create?: XOR<PackageCreateWithoutShootsInput, PackageUncheckedCreateWithoutShootsInput>
    connectOrCreate?: PackageCreateOrConnectWithoutShootsInput
    upsert?: PackageUpsertWithoutShootsInput
    connect?: PackageWhereUniqueInput
    update?: XOR<XOR<PackageUpdateToOneWithWhereWithoutShootsInput, PackageUpdateWithoutShootsInput>, PackageUncheckedUpdateWithoutShootsInput>
  }

  export type ShotListUpdateOneWithoutShootNestedInput = {
    create?: XOR<ShotListCreateWithoutShootInput, ShotListUncheckedCreateWithoutShootInput>
    connectOrCreate?: ShotListCreateOrConnectWithoutShootInput
    upsert?: ShotListUpsertWithoutShootInput
    disconnect?: ShotListWhereInput | boolean
    delete?: ShotListWhereInput | boolean
    connect?: ShotListWhereUniqueInput
    update?: XOR<XOR<ShotListUpdateToOneWithWhereWithoutShootInput, ShotListUpdateWithoutShootInput>, ShotListUncheckedUpdateWithoutShootInput>
  }

  export type GalleryUpdateManyWithoutShootNestedInput = {
    create?: XOR<GalleryCreateWithoutShootInput, GalleryUncheckedCreateWithoutShootInput> | GalleryCreateWithoutShootInput[] | GalleryUncheckedCreateWithoutShootInput[]
    connectOrCreate?: GalleryCreateOrConnectWithoutShootInput | GalleryCreateOrConnectWithoutShootInput[]
    upsert?: GalleryUpsertWithWhereUniqueWithoutShootInput | GalleryUpsertWithWhereUniqueWithoutShootInput[]
    createMany?: GalleryCreateManyShootInputEnvelope
    set?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
    disconnect?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
    delete?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
    connect?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
    update?: GalleryUpdateWithWhereUniqueWithoutShootInput | GalleryUpdateWithWhereUniqueWithoutShootInput[]
    updateMany?: GalleryUpdateManyWithWhereWithoutShootInput | GalleryUpdateManyWithWhereWithoutShootInput[]
    deleteMany?: GalleryScalarWhereInput | GalleryScalarWhereInput[]
  }

  export type GalleryUncheckedUpdateManyWithoutShootNestedInput = {
    create?: XOR<GalleryCreateWithoutShootInput, GalleryUncheckedCreateWithoutShootInput> | GalleryCreateWithoutShootInput[] | GalleryUncheckedCreateWithoutShootInput[]
    connectOrCreate?: GalleryCreateOrConnectWithoutShootInput | GalleryCreateOrConnectWithoutShootInput[]
    upsert?: GalleryUpsertWithWhereUniqueWithoutShootInput | GalleryUpsertWithWhereUniqueWithoutShootInput[]
    createMany?: GalleryCreateManyShootInputEnvelope
    set?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
    disconnect?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
    delete?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
    connect?: GalleryWhereUniqueInput | GalleryWhereUniqueInput[]
    update?: GalleryUpdateWithWhereUniqueWithoutShootInput | GalleryUpdateWithWhereUniqueWithoutShootInput[]
    updateMany?: GalleryUpdateManyWithWhereWithoutShootInput | GalleryUpdateManyWithWhereWithoutShootInput[]
    deleteMany?: GalleryScalarWhereInput | GalleryScalarWhereInput[]
  }

  export type TenantCreateNestedOneWithoutShotListsInput = {
    create?: XOR<TenantCreateWithoutShotListsInput, TenantUncheckedCreateWithoutShotListsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutShotListsInput
    connect?: TenantWhereUniqueInput
  }

  export type PackageCreateNestedOneWithoutShotListsInput = {
    create?: XOR<PackageCreateWithoutShotListsInput, PackageUncheckedCreateWithoutShotListsInput>
    connectOrCreate?: PackageCreateOrConnectWithoutShotListsInput
    connect?: PackageWhereUniqueInput
  }

  export type ShootCreateNestedOneWithoutShotListInput = {
    create?: XOR<ShootCreateWithoutShotListInput, ShootUncheckedCreateWithoutShotListInput>
    connectOrCreate?: ShootCreateOrConnectWithoutShotListInput
    connect?: ShootWhereUniqueInput
  }

  export type ShootUncheckedCreateNestedOneWithoutShotListInput = {
    create?: XOR<ShootCreateWithoutShotListInput, ShootUncheckedCreateWithoutShotListInput>
    connectOrCreate?: ShootCreateOrConnectWithoutShotListInput
    connect?: ShootWhereUniqueInput
  }

  export type EnumShotListStatusFieldUpdateOperationsInput = {
    set?: $Enums.ShotListStatus
  }

  export type TenantUpdateOneRequiredWithoutShotListsNestedInput = {
    create?: XOR<TenantCreateWithoutShotListsInput, TenantUncheckedCreateWithoutShotListsInput>
    connectOrCreate?: TenantCreateOrConnectWithoutShotListsInput
    upsert?: TenantUpsertWithoutShotListsInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutShotListsInput, TenantUpdateWithoutShotListsInput>, TenantUncheckedUpdateWithoutShotListsInput>
  }

  export type PackageUpdateOneWithoutShotListsNestedInput = {
    create?: XOR<PackageCreateWithoutShotListsInput, PackageUncheckedCreateWithoutShotListsInput>
    connectOrCreate?: PackageCreateOrConnectWithoutShotListsInput
    upsert?: PackageUpsertWithoutShotListsInput
    disconnect?: PackageWhereInput | boolean
    delete?: PackageWhereInput | boolean
    connect?: PackageWhereUniqueInput
    update?: XOR<XOR<PackageUpdateToOneWithWhereWithoutShotListsInput, PackageUpdateWithoutShotListsInput>, PackageUncheckedUpdateWithoutShotListsInput>
  }

  export type ShootUpdateOneWithoutShotListNestedInput = {
    create?: XOR<ShootCreateWithoutShotListInput, ShootUncheckedCreateWithoutShotListInput>
    connectOrCreate?: ShootCreateOrConnectWithoutShotListInput
    upsert?: ShootUpsertWithoutShotListInput
    disconnect?: ShootWhereInput | boolean
    delete?: ShootWhereInput | boolean
    connect?: ShootWhereUniqueInput
    update?: XOR<XOR<ShootUpdateToOneWithWhereWithoutShotListInput, ShootUpdateWithoutShotListInput>, ShootUncheckedUpdateWithoutShotListInput>
  }

  export type ShootUncheckedUpdateOneWithoutShotListNestedInput = {
    create?: XOR<ShootCreateWithoutShotListInput, ShootUncheckedCreateWithoutShotListInput>
    connectOrCreate?: ShootCreateOrConnectWithoutShotListInput
    upsert?: ShootUpsertWithoutShotListInput
    disconnect?: ShootWhereInput | boolean
    delete?: ShootWhereInput | boolean
    connect?: ShootWhereUniqueInput
    update?: XOR<XOR<ShootUpdateToOneWithWhereWithoutShotListInput, ShootUpdateWithoutShotListInput>, ShootUncheckedUpdateWithoutShotListInput>
  }

  export type TenantCreateNestedOneWithoutGalleriesInput = {
    create?: XOR<TenantCreateWithoutGalleriesInput, TenantUncheckedCreateWithoutGalleriesInput>
    connectOrCreate?: TenantCreateOrConnectWithoutGalleriesInput
    connect?: TenantWhereUniqueInput
  }

  export type ShootCreateNestedOneWithoutGalleriesInput = {
    create?: XOR<ShootCreateWithoutGalleriesInput, ShootUncheckedCreateWithoutGalleriesInput>
    connectOrCreate?: ShootCreateOrConnectWithoutGalleriesInput
    connect?: ShootWhereUniqueInput
  }

  export type GalleryPhotoCreateNestedManyWithoutGalleryInput = {
    create?: XOR<GalleryPhotoCreateWithoutGalleryInput, GalleryPhotoUncheckedCreateWithoutGalleryInput> | GalleryPhotoCreateWithoutGalleryInput[] | GalleryPhotoUncheckedCreateWithoutGalleryInput[]
    connectOrCreate?: GalleryPhotoCreateOrConnectWithoutGalleryInput | GalleryPhotoCreateOrConnectWithoutGalleryInput[]
    createMany?: GalleryPhotoCreateManyGalleryInputEnvelope
    connect?: GalleryPhotoWhereUniqueInput | GalleryPhotoWhereUniqueInput[]
  }

  export type GalleryPhotoUncheckedCreateNestedManyWithoutGalleryInput = {
    create?: XOR<GalleryPhotoCreateWithoutGalleryInput, GalleryPhotoUncheckedCreateWithoutGalleryInput> | GalleryPhotoCreateWithoutGalleryInput[] | GalleryPhotoUncheckedCreateWithoutGalleryInput[]
    connectOrCreate?: GalleryPhotoCreateOrConnectWithoutGalleryInput | GalleryPhotoCreateOrConnectWithoutGalleryInput[]
    createMany?: GalleryPhotoCreateManyGalleryInputEnvelope
    connect?: GalleryPhotoWhereUniqueInput | GalleryPhotoWhereUniqueInput[]
  }

  export type EnumGalleryStatusFieldUpdateOperationsInput = {
    set?: $Enums.GalleryStatus
  }

  export type TenantUpdateOneRequiredWithoutGalleriesNestedInput = {
    create?: XOR<TenantCreateWithoutGalleriesInput, TenantUncheckedCreateWithoutGalleriesInput>
    connectOrCreate?: TenantCreateOrConnectWithoutGalleriesInput
    upsert?: TenantUpsertWithoutGalleriesInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutGalleriesInput, TenantUpdateWithoutGalleriesInput>, TenantUncheckedUpdateWithoutGalleriesInput>
  }

  export type ShootUpdateOneRequiredWithoutGalleriesNestedInput = {
    create?: XOR<ShootCreateWithoutGalleriesInput, ShootUncheckedCreateWithoutGalleriesInput>
    connectOrCreate?: ShootCreateOrConnectWithoutGalleriesInput
    upsert?: ShootUpsertWithoutGalleriesInput
    connect?: ShootWhereUniqueInput
    update?: XOR<XOR<ShootUpdateToOneWithWhereWithoutGalleriesInput, ShootUpdateWithoutGalleriesInput>, ShootUncheckedUpdateWithoutGalleriesInput>
  }

  export type GalleryPhotoUpdateManyWithoutGalleryNestedInput = {
    create?: XOR<GalleryPhotoCreateWithoutGalleryInput, GalleryPhotoUncheckedCreateWithoutGalleryInput> | GalleryPhotoCreateWithoutGalleryInput[] | GalleryPhotoUncheckedCreateWithoutGalleryInput[]
    connectOrCreate?: GalleryPhotoCreateOrConnectWithoutGalleryInput | GalleryPhotoCreateOrConnectWithoutGalleryInput[]
    upsert?: GalleryPhotoUpsertWithWhereUniqueWithoutGalleryInput | GalleryPhotoUpsertWithWhereUniqueWithoutGalleryInput[]
    createMany?: GalleryPhotoCreateManyGalleryInputEnvelope
    set?: GalleryPhotoWhereUniqueInput | GalleryPhotoWhereUniqueInput[]
    disconnect?: GalleryPhotoWhereUniqueInput | GalleryPhotoWhereUniqueInput[]
    delete?: GalleryPhotoWhereUniqueInput | GalleryPhotoWhereUniqueInput[]
    connect?: GalleryPhotoWhereUniqueInput | GalleryPhotoWhereUniqueInput[]
    update?: GalleryPhotoUpdateWithWhereUniqueWithoutGalleryInput | GalleryPhotoUpdateWithWhereUniqueWithoutGalleryInput[]
    updateMany?: GalleryPhotoUpdateManyWithWhereWithoutGalleryInput | GalleryPhotoUpdateManyWithWhereWithoutGalleryInput[]
    deleteMany?: GalleryPhotoScalarWhereInput | GalleryPhotoScalarWhereInput[]
  }

  export type GalleryPhotoUncheckedUpdateManyWithoutGalleryNestedInput = {
    create?: XOR<GalleryPhotoCreateWithoutGalleryInput, GalleryPhotoUncheckedCreateWithoutGalleryInput> | GalleryPhotoCreateWithoutGalleryInput[] | GalleryPhotoUncheckedCreateWithoutGalleryInput[]
    connectOrCreate?: GalleryPhotoCreateOrConnectWithoutGalleryInput | GalleryPhotoCreateOrConnectWithoutGalleryInput[]
    upsert?: GalleryPhotoUpsertWithWhereUniqueWithoutGalleryInput | GalleryPhotoUpsertWithWhereUniqueWithoutGalleryInput[]
    createMany?: GalleryPhotoCreateManyGalleryInputEnvelope
    set?: GalleryPhotoWhereUniqueInput | GalleryPhotoWhereUniqueInput[]
    disconnect?: GalleryPhotoWhereUniqueInput | GalleryPhotoWhereUniqueInput[]
    delete?: GalleryPhotoWhereUniqueInput | GalleryPhotoWhereUniqueInput[]
    connect?: GalleryPhotoWhereUniqueInput | GalleryPhotoWhereUniqueInput[]
    update?: GalleryPhotoUpdateWithWhereUniqueWithoutGalleryInput | GalleryPhotoUpdateWithWhereUniqueWithoutGalleryInput[]
    updateMany?: GalleryPhotoUpdateManyWithWhereWithoutGalleryInput | GalleryPhotoUpdateManyWithWhereWithoutGalleryInput[]
    deleteMany?: GalleryPhotoScalarWhereInput | GalleryPhotoScalarWhereInput[]
  }

  export type GalleryCreateNestedOneWithoutPhotosInput = {
    create?: XOR<GalleryCreateWithoutPhotosInput, GalleryUncheckedCreateWithoutPhotosInput>
    connectOrCreate?: GalleryCreateOrConnectWithoutPhotosInput
    connect?: GalleryWhereUniqueInput
  }

  export type GalleryUpdateOneRequiredWithoutPhotosNestedInput = {
    create?: XOR<GalleryCreateWithoutPhotosInput, GalleryUncheckedCreateWithoutPhotosInput>
    connectOrCreate?: GalleryCreateOrConnectWithoutPhotosInput
    upsert?: GalleryUpsertWithoutPhotosInput
    connect?: GalleryWhereUniqueInput
    update?: XOR<XOR<GalleryUpdateToOneWithWhereWithoutPhotosInput, GalleryUpdateWithoutPhotosInput>, GalleryUncheckedUpdateWithoutPhotosInput>
  }

  export type TenantCreateNestedOneWithoutInvoicesInput = {
    create?: XOR<TenantCreateWithoutInvoicesInput, TenantUncheckedCreateWithoutInvoicesInput>
    connectOrCreate?: TenantCreateOrConnectWithoutInvoicesInput
    connect?: TenantWhereUniqueInput
  }

  export type ClientCreateNestedOneWithoutInvoicesInput = {
    create?: XOR<ClientCreateWithoutInvoicesInput, ClientUncheckedCreateWithoutInvoicesInput>
    connectOrCreate?: ClientCreateOrConnectWithoutInvoicesInput
    connect?: ClientWhereUniqueInput
  }

  export type PackageCreateNestedOneWithoutInvoicesInput = {
    create?: XOR<PackageCreateWithoutInvoicesInput, PackageUncheckedCreateWithoutInvoicesInput>
    connectOrCreate?: PackageCreateOrConnectWithoutInvoicesInput
    connect?: PackageWhereUniqueInput
  }

  export type EnumInvoiceStatusFieldUpdateOperationsInput = {
    set?: $Enums.InvoiceStatus
  }

  export type TenantUpdateOneRequiredWithoutInvoicesNestedInput = {
    create?: XOR<TenantCreateWithoutInvoicesInput, TenantUncheckedCreateWithoutInvoicesInput>
    connectOrCreate?: TenantCreateOrConnectWithoutInvoicesInput
    upsert?: TenantUpsertWithoutInvoicesInput
    connect?: TenantWhereUniqueInput
    update?: XOR<XOR<TenantUpdateToOneWithWhereWithoutInvoicesInput, TenantUpdateWithoutInvoicesInput>, TenantUncheckedUpdateWithoutInvoicesInput>
  }

  export type ClientUpdateOneRequiredWithoutInvoicesNestedInput = {
    create?: XOR<ClientCreateWithoutInvoicesInput, ClientUncheckedCreateWithoutInvoicesInput>
    connectOrCreate?: ClientCreateOrConnectWithoutInvoicesInput
    upsert?: ClientUpsertWithoutInvoicesInput
    connect?: ClientWhereUniqueInput
    update?: XOR<XOR<ClientUpdateToOneWithWhereWithoutInvoicesInput, ClientUpdateWithoutInvoicesInput>, ClientUncheckedUpdateWithoutInvoicesInput>
  }

  export type PackageUpdateOneWithoutInvoicesNestedInput = {
    create?: XOR<PackageCreateWithoutInvoicesInput, PackageUncheckedCreateWithoutInvoicesInput>
    connectOrCreate?: PackageCreateOrConnectWithoutInvoicesInput
    upsert?: PackageUpsertWithoutInvoicesInput
    disconnect?: PackageWhereInput | boolean
    delete?: PackageWhereInput | boolean
    connect?: PackageWhereUniqueInput
    update?: XOR<XOR<PackageUpdateToOneWithWhereWithoutInvoicesInput, PackageUpdateWithoutInvoicesInput>, PackageUncheckedUpdateWithoutInvoicesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumPackageStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.PackageStatus | EnumPackageStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PackageStatus[] | ListEnumPackageStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PackageStatus[] | ListEnumPackageStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPackageStatusFilter<$PrismaModel> | $Enums.PackageStatus
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumPackageStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PackageStatus | EnumPackageStatusFieldRefInput<$PrismaModel>
    in?: $Enums.PackageStatus[] | ListEnumPackageStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.PackageStatus[] | ListEnumPackageStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumPackageStatusWithAggregatesFilter<$PrismaModel> | $Enums.PackageStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPackageStatusFilter<$PrismaModel>
    _max?: NestedEnumPackageStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumShotListStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ShotListStatus | EnumShotListStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ShotListStatus[] | ListEnumShotListStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ShotListStatus[] | ListEnumShotListStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumShotListStatusFilter<$PrismaModel> | $Enums.ShotListStatus
  }

  export type NestedEnumShotListStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ShotListStatus | EnumShotListStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ShotListStatus[] | ListEnumShotListStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ShotListStatus[] | ListEnumShotListStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumShotListStatusWithAggregatesFilter<$PrismaModel> | $Enums.ShotListStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumShotListStatusFilter<$PrismaModel>
    _max?: NestedEnumShotListStatusFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumGalleryStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.GalleryStatus | EnumGalleryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.GalleryStatus[] | ListEnumGalleryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.GalleryStatus[] | ListEnumGalleryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumGalleryStatusFilter<$PrismaModel> | $Enums.GalleryStatus
  }

  export type NestedEnumGalleryStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.GalleryStatus | EnumGalleryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.GalleryStatus[] | ListEnumGalleryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.GalleryStatus[] | ListEnumGalleryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumGalleryStatusWithAggregatesFilter<$PrismaModel> | $Enums.GalleryStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumGalleryStatusFilter<$PrismaModel>
    _max?: NestedEnumGalleryStatusFilter<$PrismaModel>
  }

  export type NestedEnumInvoiceStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.InvoiceStatus | EnumInvoiceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InvoiceStatus[] | ListEnumInvoiceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InvoiceStatus[] | ListEnumInvoiceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInvoiceStatusFilter<$PrismaModel> | $Enums.InvoiceStatus
  }

  export type NestedEnumInvoiceStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InvoiceStatus | EnumInvoiceStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InvoiceStatus[] | ListEnumInvoiceStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InvoiceStatus[] | ListEnumInvoiceStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInvoiceStatusWithAggregatesFilter<$PrismaModel> | $Enums.InvoiceStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInvoiceStatusFilter<$PrismaModel>
    _max?: NestedEnumInvoiceStatusFilter<$PrismaModel>
  }

  export type UserCreateWithoutTenantInput = {
    id?: string
    email: string
    name?: string | null
    passwordHash: string
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUncheckedCreateWithoutTenantInput = {
    id?: string
    email: string
    name?: string | null
    passwordHash: string
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCreateOrConnectWithoutTenantInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput>
  }

  export type UserCreateManyTenantInputEnvelope = {
    data: UserCreateManyTenantInput | UserCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type PackageCreateWithoutTenantInput = {
    id?: string
    title: string
    status?: $Enums.PackageStatus
    eventType?: string | null
    eventDate?: Date | string | null
    shotCount?: number | null
    deliveryDays?: number | null
    galleryUrl?: string | null
    editingHours?: number | null
    styleTags?: PackageCreatestyleTagsInput | string[]
    equipment?: PackageCreateequipmentInput | string[]
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: number | null
    travelCosts?: number | null
    totalPrice?: number | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    client: ClientCreateNestedOneWithoutPackagesInput
    shoots?: ShootCreateNestedManyWithoutPackageInput
    addons?: PackageAddonCreateNestedManyWithoutPackageInput
    invoices?: InvoiceCreateNestedManyWithoutPackageInput
    shotLists?: ShotListCreateNestedManyWithoutPackageInput
  }

  export type PackageUncheckedCreateWithoutTenantInput = {
    id?: string
    clientId: string
    title: string
    status?: $Enums.PackageStatus
    eventType?: string | null
    eventDate?: Date | string | null
    shotCount?: number | null
    deliveryDays?: number | null
    galleryUrl?: string | null
    editingHours?: number | null
    styleTags?: PackageCreatestyleTagsInput | string[]
    equipment?: PackageCreateequipmentInput | string[]
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: number | null
    travelCosts?: number | null
    totalPrice?: number | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    shoots?: ShootUncheckedCreateNestedManyWithoutPackageInput
    addons?: PackageAddonUncheckedCreateNestedManyWithoutPackageInput
    invoices?: InvoiceUncheckedCreateNestedManyWithoutPackageInput
    shotLists?: ShotListUncheckedCreateNestedManyWithoutPackageInput
  }

  export type PackageCreateOrConnectWithoutTenantInput = {
    where: PackageWhereUniqueInput
    create: XOR<PackageCreateWithoutTenantInput, PackageUncheckedCreateWithoutTenantInput>
  }

  export type PackageCreateManyTenantInputEnvelope = {
    data: PackageCreateManyTenantInput | PackageCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type ShootCreateWithoutTenantInput = {
    id?: string
    date: Date | string
    startTime: string
    endTime: string
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootCreatelocationsInput | InputJsonValue[]
    sunsetTime?: Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: string | null
    venueName?: string | null
    venueAddress?: string | null
    lightingNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    package: PackageCreateNestedOneWithoutShootsInput
    shotList?: ShotListCreateNestedOneWithoutShootInput
    galleries?: GalleryCreateNestedManyWithoutShootInput
  }

  export type ShootUncheckedCreateWithoutTenantInput = {
    id?: string
    packageId: string
    date: Date | string
    startTime: string
    endTime: string
    shotListId?: string | null
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootCreatelocationsInput | InputJsonValue[]
    sunsetTime?: Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: string | null
    venueName?: string | null
    venueAddress?: string | null
    lightingNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    galleries?: GalleryUncheckedCreateNestedManyWithoutShootInput
  }

  export type ShootCreateOrConnectWithoutTenantInput = {
    where: ShootWhereUniqueInput
    create: XOR<ShootCreateWithoutTenantInput, ShootUncheckedCreateWithoutTenantInput>
  }

  export type ShootCreateManyTenantInputEnvelope = {
    data: ShootCreateManyTenantInput | ShootCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type ShotListCreateWithoutTenantInput = {
    id?: string
    name: string
    status?: $Enums.ShotListStatus
    eventType: string
    aiGenerated?: boolean
    sections: JsonNullValueInput | InputJsonValue
    totalShots: number
    mustHaveCount: number
    estimatedTime?: number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    package?: PackageCreateNestedOneWithoutShotListsInput
    shoot?: ShootCreateNestedOneWithoutShotListInput
  }

  export type ShotListUncheckedCreateWithoutTenantInput = {
    id?: string
    packageId?: string | null
    name: string
    status?: $Enums.ShotListStatus
    eventType: string
    aiGenerated?: boolean
    sections: JsonNullValueInput | InputJsonValue
    totalShots: number
    mustHaveCount: number
    estimatedTime?: number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    shoot?: ShootUncheckedCreateNestedOneWithoutShotListInput
  }

  export type ShotListCreateOrConnectWithoutTenantInput = {
    where: ShotListWhereUniqueInput
    create: XOR<ShotListCreateWithoutTenantInput, ShotListUncheckedCreateWithoutTenantInput>
  }

  export type ShotListCreateManyTenantInputEnvelope = {
    data: ShotListCreateManyTenantInput | ShotListCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type GalleryCreateWithoutTenantInput = {
    id?: string
    name: string
    status?: $Enums.GalleryStatus
    totalPhotos?: number
    selectedPhotos?: number
    aiCurated?: boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: string | null
    password?: string | null
    expiresAt?: Date | string | null
    downloadEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    shoot: ShootCreateNestedOneWithoutGalleriesInput
    photos?: GalleryPhotoCreateNestedManyWithoutGalleryInput
  }

  export type GalleryUncheckedCreateWithoutTenantInput = {
    id?: string
    shootId: string
    name: string
    status?: $Enums.GalleryStatus
    totalPhotos?: number
    selectedPhotos?: number
    aiCurated?: boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: string | null
    password?: string | null
    expiresAt?: Date | string | null
    downloadEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    photos?: GalleryPhotoUncheckedCreateNestedManyWithoutGalleryInput
  }

  export type GalleryCreateOrConnectWithoutTenantInput = {
    where: GalleryWhereUniqueInput
    create: XOR<GalleryCreateWithoutTenantInput, GalleryUncheckedCreateWithoutTenantInput>
  }

  export type GalleryCreateManyTenantInputEnvelope = {
    data: GalleryCreateManyTenantInput | GalleryCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type ClientCreateWithoutTenantInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    type?: string
    tags?: ClientCreatetagsInput | string[]
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    packages?: PackageCreateNestedManyWithoutClientInput
    invoices?: InvoiceCreateNestedManyWithoutClientInput
  }

  export type ClientUncheckedCreateWithoutTenantInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    type?: string
    tags?: ClientCreatetagsInput | string[]
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    packages?: PackageUncheckedCreateNestedManyWithoutClientInput
    invoices?: InvoiceUncheckedCreateNestedManyWithoutClientInput
  }

  export type ClientCreateOrConnectWithoutTenantInput = {
    where: ClientWhereUniqueInput
    create: XOR<ClientCreateWithoutTenantInput, ClientUncheckedCreateWithoutTenantInput>
  }

  export type ClientCreateManyTenantInputEnvelope = {
    data: ClientCreateManyTenantInput | ClientCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type InvoiceCreateWithoutTenantInput = {
    id?: string
    invoiceNumber: string
    status?: $Enums.InvoiceStatus
    items: JsonNullValueInput | InputJsonValue
    subtotal: number
    tax?: number
    total: number
    dueDate?: Date | string | null
    paidAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    client: ClientCreateNestedOneWithoutInvoicesInput
    package?: PackageCreateNestedOneWithoutInvoicesInput
  }

  export type InvoiceUncheckedCreateWithoutTenantInput = {
    id?: string
    clientId: string
    packageId?: string | null
    invoiceNumber: string
    status?: $Enums.InvoiceStatus
    items: JsonNullValueInput | InputJsonValue
    subtotal: number
    tax?: number
    total: number
    dueDate?: Date | string | null
    paidAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InvoiceCreateOrConnectWithoutTenantInput = {
    where: InvoiceWhereUniqueInput
    create: XOR<InvoiceCreateWithoutTenantInput, InvoiceUncheckedCreateWithoutTenantInput>
  }

  export type InvoiceCreateManyTenantInputEnvelope = {
    data: InvoiceCreateManyTenantInput | InvoiceCreateManyTenantInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithWhereUniqueWithoutTenantInput = {
    where: UserWhereUniqueInput
    update: XOR<UserUpdateWithoutTenantInput, UserUncheckedUpdateWithoutTenantInput>
    create: XOR<UserCreateWithoutTenantInput, UserUncheckedCreateWithoutTenantInput>
  }

  export type UserUpdateWithWhereUniqueWithoutTenantInput = {
    where: UserWhereUniqueInput
    data: XOR<UserUpdateWithoutTenantInput, UserUncheckedUpdateWithoutTenantInput>
  }

  export type UserUpdateManyWithWhereWithoutTenantInput = {
    where: UserScalarWhereInput
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyWithoutTenantInput>
  }

  export type UserScalarWhereInput = {
    AND?: UserScalarWhereInput | UserScalarWhereInput[]
    OR?: UserScalarWhereInput[]
    NOT?: UserScalarWhereInput | UserScalarWhereInput[]
    id?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    passwordHash?: StringFilter<"User"> | string
    role?: StringFilter<"User"> | string
    tenantId?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
  }

  export type PackageUpsertWithWhereUniqueWithoutTenantInput = {
    where: PackageWhereUniqueInput
    update: XOR<PackageUpdateWithoutTenantInput, PackageUncheckedUpdateWithoutTenantInput>
    create: XOR<PackageCreateWithoutTenantInput, PackageUncheckedCreateWithoutTenantInput>
  }

  export type PackageUpdateWithWhereUniqueWithoutTenantInput = {
    where: PackageWhereUniqueInput
    data: XOR<PackageUpdateWithoutTenantInput, PackageUncheckedUpdateWithoutTenantInput>
  }

  export type PackageUpdateManyWithWhereWithoutTenantInput = {
    where: PackageScalarWhereInput
    data: XOR<PackageUpdateManyMutationInput, PackageUncheckedUpdateManyWithoutTenantInput>
  }

  export type PackageScalarWhereInput = {
    AND?: PackageScalarWhereInput | PackageScalarWhereInput[]
    OR?: PackageScalarWhereInput[]
    NOT?: PackageScalarWhereInput | PackageScalarWhereInput[]
    id?: StringFilter<"Package"> | string
    tenantId?: StringFilter<"Package"> | string
    clientId?: StringFilter<"Package"> | string
    title?: StringFilter<"Package"> | string
    status?: EnumPackageStatusFilter<"Package"> | $Enums.PackageStatus
    eventType?: StringNullableFilter<"Package"> | string | null
    eventDate?: DateTimeNullableFilter<"Package"> | Date | string | null
    shotCount?: IntNullableFilter<"Package"> | number | null
    deliveryDays?: IntNullableFilter<"Package"> | number | null
    galleryUrl?: StringNullableFilter<"Package"> | string | null
    editingHours?: FloatNullableFilter<"Package"> | number | null
    styleTags?: StringNullableListFilter<"Package">
    equipment?: StringNullableListFilter<"Package">
    secondShooter?: BoolFilter<"Package"> | boolean
    rawFilesIncluded?: BoolFilter<"Package"> | boolean
    timeline?: JsonNullableFilter<"Package">
    basePrice?: IntNullableFilter<"Package"> | number | null
    travelCosts?: IntNullableFilter<"Package"> | number | null
    totalPrice?: IntNullableFilter<"Package"> | number | null
    notes?: StringNullableFilter<"Package"> | string | null
    createdAt?: DateTimeFilter<"Package"> | Date | string
    updatedAt?: DateTimeFilter<"Package"> | Date | string
  }

  export type ShootUpsertWithWhereUniqueWithoutTenantInput = {
    where: ShootWhereUniqueInput
    update: XOR<ShootUpdateWithoutTenantInput, ShootUncheckedUpdateWithoutTenantInput>
    create: XOR<ShootCreateWithoutTenantInput, ShootUncheckedCreateWithoutTenantInput>
  }

  export type ShootUpdateWithWhereUniqueWithoutTenantInput = {
    where: ShootWhereUniqueInput
    data: XOR<ShootUpdateWithoutTenantInput, ShootUncheckedUpdateWithoutTenantInput>
  }

  export type ShootUpdateManyWithWhereWithoutTenantInput = {
    where: ShootScalarWhereInput
    data: XOR<ShootUpdateManyMutationInput, ShootUncheckedUpdateManyWithoutTenantInput>
  }

  export type ShootScalarWhereInput = {
    AND?: ShootScalarWhereInput | ShootScalarWhereInput[]
    OR?: ShootScalarWhereInput[]
    NOT?: ShootScalarWhereInput | ShootScalarWhereInput[]
    id?: StringFilter<"Shoot"> | string
    tenantId?: StringFilter<"Shoot"> | string
    packageId?: StringFilter<"Shoot"> | string
    date?: DateTimeFilter<"Shoot"> | Date | string
    startTime?: StringFilter<"Shoot"> | string
    endTime?: StringFilter<"Shoot"> | string
    shotListId?: StringNullableFilter<"Shoot"> | string | null
    timeline?: JsonNullableFilter<"Shoot">
    locations?: JsonNullableListFilter<"Shoot">
    sunsetTime?: DateTimeNullableFilter<"Shoot"> | Date | string | null
    weatherForecast?: JsonNullableFilter<"Shoot">
    venueType?: StringNullableFilter<"Shoot"> | string | null
    venueName?: StringNullableFilter<"Shoot"> | string | null
    venueAddress?: StringNullableFilter<"Shoot"> | string | null
    lightingNotes?: StringNullableFilter<"Shoot"> | string | null
    notes?: StringNullableFilter<"Shoot"> | string | null
    createdAt?: DateTimeFilter<"Shoot"> | Date | string
    updatedAt?: DateTimeFilter<"Shoot"> | Date | string
  }

  export type ShotListUpsertWithWhereUniqueWithoutTenantInput = {
    where: ShotListWhereUniqueInput
    update: XOR<ShotListUpdateWithoutTenantInput, ShotListUncheckedUpdateWithoutTenantInput>
    create: XOR<ShotListCreateWithoutTenantInput, ShotListUncheckedCreateWithoutTenantInput>
  }

  export type ShotListUpdateWithWhereUniqueWithoutTenantInput = {
    where: ShotListWhereUniqueInput
    data: XOR<ShotListUpdateWithoutTenantInput, ShotListUncheckedUpdateWithoutTenantInput>
  }

  export type ShotListUpdateManyWithWhereWithoutTenantInput = {
    where: ShotListScalarWhereInput
    data: XOR<ShotListUpdateManyMutationInput, ShotListUncheckedUpdateManyWithoutTenantInput>
  }

  export type ShotListScalarWhereInput = {
    AND?: ShotListScalarWhereInput | ShotListScalarWhereInput[]
    OR?: ShotListScalarWhereInput[]
    NOT?: ShotListScalarWhereInput | ShotListScalarWhereInput[]
    id?: StringFilter<"ShotList"> | string
    tenantId?: StringFilter<"ShotList"> | string
    packageId?: StringNullableFilter<"ShotList"> | string | null
    name?: StringFilter<"ShotList"> | string
    status?: EnumShotListStatusFilter<"ShotList"> | $Enums.ShotListStatus
    eventType?: StringFilter<"ShotList"> | string
    aiGenerated?: BoolFilter<"ShotList"> | boolean
    sections?: JsonFilter<"ShotList">
    totalShots?: IntFilter<"ShotList"> | number
    mustHaveCount?: IntFilter<"ShotList"> | number
    estimatedTime?: IntNullableFilter<"ShotList"> | number | null
    equipmentList?: JsonNullableFilter<"ShotList">
    lightingPlan?: JsonNullableFilter<"ShotList">
    backupPlans?: JsonNullableFilter<"ShotList">
    createdAt?: DateTimeFilter<"ShotList"> | Date | string
    updatedAt?: DateTimeFilter<"ShotList"> | Date | string
  }

  export type GalleryUpsertWithWhereUniqueWithoutTenantInput = {
    where: GalleryWhereUniqueInput
    update: XOR<GalleryUpdateWithoutTenantInput, GalleryUncheckedUpdateWithoutTenantInput>
    create: XOR<GalleryCreateWithoutTenantInput, GalleryUncheckedCreateWithoutTenantInput>
  }

  export type GalleryUpdateWithWhereUniqueWithoutTenantInput = {
    where: GalleryWhereUniqueInput
    data: XOR<GalleryUpdateWithoutTenantInput, GalleryUncheckedUpdateWithoutTenantInput>
  }

  export type GalleryUpdateManyWithWhereWithoutTenantInput = {
    where: GalleryScalarWhereInput
    data: XOR<GalleryUpdateManyMutationInput, GalleryUncheckedUpdateManyWithoutTenantInput>
  }

  export type GalleryScalarWhereInput = {
    AND?: GalleryScalarWhereInput | GalleryScalarWhereInput[]
    OR?: GalleryScalarWhereInput[]
    NOT?: GalleryScalarWhereInput | GalleryScalarWhereInput[]
    id?: StringFilter<"Gallery"> | string
    tenantId?: StringFilter<"Gallery"> | string
    shootId?: StringFilter<"Gallery"> | string
    name?: StringFilter<"Gallery"> | string
    status?: EnumGalleryStatusFilter<"Gallery"> | $Enums.GalleryStatus
    totalPhotos?: IntFilter<"Gallery"> | number
    selectedPhotos?: IntFilter<"Gallery"> | number
    aiCurated?: BoolFilter<"Gallery"> | boolean
    curationData?: JsonNullableFilter<"Gallery">
    publicUrl?: StringNullableFilter<"Gallery"> | string | null
    password?: StringNullableFilter<"Gallery"> | string | null
    expiresAt?: DateTimeNullableFilter<"Gallery"> | Date | string | null
    downloadEnabled?: BoolFilter<"Gallery"> | boolean
    createdAt?: DateTimeFilter<"Gallery"> | Date | string
    updatedAt?: DateTimeFilter<"Gallery"> | Date | string
  }

  export type ClientUpsertWithWhereUniqueWithoutTenantInput = {
    where: ClientWhereUniqueInput
    update: XOR<ClientUpdateWithoutTenantInput, ClientUncheckedUpdateWithoutTenantInput>
    create: XOR<ClientCreateWithoutTenantInput, ClientUncheckedCreateWithoutTenantInput>
  }

  export type ClientUpdateWithWhereUniqueWithoutTenantInput = {
    where: ClientWhereUniqueInput
    data: XOR<ClientUpdateWithoutTenantInput, ClientUncheckedUpdateWithoutTenantInput>
  }

  export type ClientUpdateManyWithWhereWithoutTenantInput = {
    where: ClientScalarWhereInput
    data: XOR<ClientUpdateManyMutationInput, ClientUncheckedUpdateManyWithoutTenantInput>
  }

  export type ClientScalarWhereInput = {
    AND?: ClientScalarWhereInput | ClientScalarWhereInput[]
    OR?: ClientScalarWhereInput[]
    NOT?: ClientScalarWhereInput | ClientScalarWhereInput[]
    id?: StringFilter<"Client"> | string
    tenantId?: StringFilter<"Client"> | string
    name?: StringFilter<"Client"> | string
    email?: StringFilter<"Client"> | string
    phone?: StringNullableFilter<"Client"> | string | null
    address?: StringNullableFilter<"Client"> | string | null
    type?: StringFilter<"Client"> | string
    tags?: StringNullableListFilter<"Client">
    notes?: StringNullableFilter<"Client"> | string | null
    createdAt?: DateTimeFilter<"Client"> | Date | string
    updatedAt?: DateTimeFilter<"Client"> | Date | string
  }

  export type InvoiceUpsertWithWhereUniqueWithoutTenantInput = {
    where: InvoiceWhereUniqueInput
    update: XOR<InvoiceUpdateWithoutTenantInput, InvoiceUncheckedUpdateWithoutTenantInput>
    create: XOR<InvoiceCreateWithoutTenantInput, InvoiceUncheckedCreateWithoutTenantInput>
  }

  export type InvoiceUpdateWithWhereUniqueWithoutTenantInput = {
    where: InvoiceWhereUniqueInput
    data: XOR<InvoiceUpdateWithoutTenantInput, InvoiceUncheckedUpdateWithoutTenantInput>
  }

  export type InvoiceUpdateManyWithWhereWithoutTenantInput = {
    where: InvoiceScalarWhereInput
    data: XOR<InvoiceUpdateManyMutationInput, InvoiceUncheckedUpdateManyWithoutTenantInput>
  }

  export type InvoiceScalarWhereInput = {
    AND?: InvoiceScalarWhereInput | InvoiceScalarWhereInput[]
    OR?: InvoiceScalarWhereInput[]
    NOT?: InvoiceScalarWhereInput | InvoiceScalarWhereInput[]
    id?: StringFilter<"Invoice"> | string
    tenantId?: StringFilter<"Invoice"> | string
    clientId?: StringFilter<"Invoice"> | string
    packageId?: StringNullableFilter<"Invoice"> | string | null
    invoiceNumber?: StringFilter<"Invoice"> | string
    status?: EnumInvoiceStatusFilter<"Invoice"> | $Enums.InvoiceStatus
    items?: JsonFilter<"Invoice">
    subtotal?: IntFilter<"Invoice"> | number
    tax?: IntFilter<"Invoice"> | number
    total?: IntFilter<"Invoice"> | number
    dueDate?: DateTimeNullableFilter<"Invoice"> | Date | string | null
    paidAt?: DateTimeNullableFilter<"Invoice"> | Date | string | null
    notes?: StringNullableFilter<"Invoice"> | string | null
    createdAt?: DateTimeFilter<"Invoice"> | Date | string
    updatedAt?: DateTimeFilter<"Invoice"> | Date | string
  }

  export type TenantCreateWithoutUsersInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    packages?: PackageCreateNestedManyWithoutTenantInput
    shoots?: ShootCreateNestedManyWithoutTenantInput
    shotLists?: ShotListCreateNestedManyWithoutTenantInput
    galleries?: GalleryCreateNestedManyWithoutTenantInput
    clients?: ClientCreateNestedManyWithoutTenantInput
    invoices?: InvoiceCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutUsersInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    packages?: PackageUncheckedCreateNestedManyWithoutTenantInput
    shoots?: ShootUncheckedCreateNestedManyWithoutTenantInput
    shotLists?: ShotListUncheckedCreateNestedManyWithoutTenantInput
    galleries?: GalleryUncheckedCreateNestedManyWithoutTenantInput
    clients?: ClientUncheckedCreateNestedManyWithoutTenantInput
    invoices?: InvoiceUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutUsersInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutUsersInput, TenantUncheckedCreateWithoutUsersInput>
  }

  export type TenantUpsertWithoutUsersInput = {
    update: XOR<TenantUpdateWithoutUsersInput, TenantUncheckedUpdateWithoutUsersInput>
    create: XOR<TenantCreateWithoutUsersInput, TenantUncheckedCreateWithoutUsersInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutUsersInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutUsersInput, TenantUncheckedUpdateWithoutUsersInput>
  }

  export type TenantUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    packages?: PackageUpdateManyWithoutTenantNestedInput
    shoots?: ShootUpdateManyWithoutTenantNestedInput
    shotLists?: ShotListUpdateManyWithoutTenantNestedInput
    galleries?: GalleryUpdateManyWithoutTenantNestedInput
    clients?: ClientUpdateManyWithoutTenantNestedInput
    invoices?: InvoiceUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutUsersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    packages?: PackageUncheckedUpdateManyWithoutTenantNestedInput
    shoots?: ShootUncheckedUpdateManyWithoutTenantNestedInput
    shotLists?: ShotListUncheckedUpdateManyWithoutTenantNestedInput
    galleries?: GalleryUncheckedUpdateManyWithoutTenantNestedInput
    clients?: ClientUncheckedUpdateManyWithoutTenantNestedInput
    invoices?: InvoiceUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type TenantCreateWithoutClientsInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutTenantInput
    packages?: PackageCreateNestedManyWithoutTenantInput
    shoots?: ShootCreateNestedManyWithoutTenantInput
    shotLists?: ShotListCreateNestedManyWithoutTenantInput
    galleries?: GalleryCreateNestedManyWithoutTenantInput
    invoices?: InvoiceCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutClientsInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutTenantInput
    packages?: PackageUncheckedCreateNestedManyWithoutTenantInput
    shoots?: ShootUncheckedCreateNestedManyWithoutTenantInput
    shotLists?: ShotListUncheckedCreateNestedManyWithoutTenantInput
    galleries?: GalleryUncheckedCreateNestedManyWithoutTenantInput
    invoices?: InvoiceUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutClientsInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutClientsInput, TenantUncheckedCreateWithoutClientsInput>
  }

  export type PackageCreateWithoutClientInput = {
    id?: string
    title: string
    status?: $Enums.PackageStatus
    eventType?: string | null
    eventDate?: Date | string | null
    shotCount?: number | null
    deliveryDays?: number | null
    galleryUrl?: string | null
    editingHours?: number | null
    styleTags?: PackageCreatestyleTagsInput | string[]
    equipment?: PackageCreateequipmentInput | string[]
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: number | null
    travelCosts?: number | null
    totalPrice?: number | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutPackagesInput
    shoots?: ShootCreateNestedManyWithoutPackageInput
    addons?: PackageAddonCreateNestedManyWithoutPackageInput
    invoices?: InvoiceCreateNestedManyWithoutPackageInput
    shotLists?: ShotListCreateNestedManyWithoutPackageInput
  }

  export type PackageUncheckedCreateWithoutClientInput = {
    id?: string
    tenantId: string
    title: string
    status?: $Enums.PackageStatus
    eventType?: string | null
    eventDate?: Date | string | null
    shotCount?: number | null
    deliveryDays?: number | null
    galleryUrl?: string | null
    editingHours?: number | null
    styleTags?: PackageCreatestyleTagsInput | string[]
    equipment?: PackageCreateequipmentInput | string[]
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: number | null
    travelCosts?: number | null
    totalPrice?: number | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    shoots?: ShootUncheckedCreateNestedManyWithoutPackageInput
    addons?: PackageAddonUncheckedCreateNestedManyWithoutPackageInput
    invoices?: InvoiceUncheckedCreateNestedManyWithoutPackageInput
    shotLists?: ShotListUncheckedCreateNestedManyWithoutPackageInput
  }

  export type PackageCreateOrConnectWithoutClientInput = {
    where: PackageWhereUniqueInput
    create: XOR<PackageCreateWithoutClientInput, PackageUncheckedCreateWithoutClientInput>
  }

  export type PackageCreateManyClientInputEnvelope = {
    data: PackageCreateManyClientInput | PackageCreateManyClientInput[]
    skipDuplicates?: boolean
  }

  export type InvoiceCreateWithoutClientInput = {
    id?: string
    invoiceNumber: string
    status?: $Enums.InvoiceStatus
    items: JsonNullValueInput | InputJsonValue
    subtotal: number
    tax?: number
    total: number
    dueDate?: Date | string | null
    paidAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutInvoicesInput
    package?: PackageCreateNestedOneWithoutInvoicesInput
  }

  export type InvoiceUncheckedCreateWithoutClientInput = {
    id?: string
    tenantId: string
    packageId?: string | null
    invoiceNumber: string
    status?: $Enums.InvoiceStatus
    items: JsonNullValueInput | InputJsonValue
    subtotal: number
    tax?: number
    total: number
    dueDate?: Date | string | null
    paidAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InvoiceCreateOrConnectWithoutClientInput = {
    where: InvoiceWhereUniqueInput
    create: XOR<InvoiceCreateWithoutClientInput, InvoiceUncheckedCreateWithoutClientInput>
  }

  export type InvoiceCreateManyClientInputEnvelope = {
    data: InvoiceCreateManyClientInput | InvoiceCreateManyClientInput[]
    skipDuplicates?: boolean
  }

  export type TenantUpsertWithoutClientsInput = {
    update: XOR<TenantUpdateWithoutClientsInput, TenantUncheckedUpdateWithoutClientsInput>
    create: XOR<TenantCreateWithoutClientsInput, TenantUncheckedCreateWithoutClientsInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutClientsInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutClientsInput, TenantUncheckedUpdateWithoutClientsInput>
  }

  export type TenantUpdateWithoutClientsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutTenantNestedInput
    packages?: PackageUpdateManyWithoutTenantNestedInput
    shoots?: ShootUpdateManyWithoutTenantNestedInput
    shotLists?: ShotListUpdateManyWithoutTenantNestedInput
    galleries?: GalleryUpdateManyWithoutTenantNestedInput
    invoices?: InvoiceUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutClientsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutTenantNestedInput
    packages?: PackageUncheckedUpdateManyWithoutTenantNestedInput
    shoots?: ShootUncheckedUpdateManyWithoutTenantNestedInput
    shotLists?: ShotListUncheckedUpdateManyWithoutTenantNestedInput
    galleries?: GalleryUncheckedUpdateManyWithoutTenantNestedInput
    invoices?: InvoiceUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type PackageUpsertWithWhereUniqueWithoutClientInput = {
    where: PackageWhereUniqueInput
    update: XOR<PackageUpdateWithoutClientInput, PackageUncheckedUpdateWithoutClientInput>
    create: XOR<PackageCreateWithoutClientInput, PackageUncheckedCreateWithoutClientInput>
  }

  export type PackageUpdateWithWhereUniqueWithoutClientInput = {
    where: PackageWhereUniqueInput
    data: XOR<PackageUpdateWithoutClientInput, PackageUncheckedUpdateWithoutClientInput>
  }

  export type PackageUpdateManyWithWhereWithoutClientInput = {
    where: PackageScalarWhereInput
    data: XOR<PackageUpdateManyMutationInput, PackageUncheckedUpdateManyWithoutClientInput>
  }

  export type InvoiceUpsertWithWhereUniqueWithoutClientInput = {
    where: InvoiceWhereUniqueInput
    update: XOR<InvoiceUpdateWithoutClientInput, InvoiceUncheckedUpdateWithoutClientInput>
    create: XOR<InvoiceCreateWithoutClientInput, InvoiceUncheckedCreateWithoutClientInput>
  }

  export type InvoiceUpdateWithWhereUniqueWithoutClientInput = {
    where: InvoiceWhereUniqueInput
    data: XOR<InvoiceUpdateWithoutClientInput, InvoiceUncheckedUpdateWithoutClientInput>
  }

  export type InvoiceUpdateManyWithWhereWithoutClientInput = {
    where: InvoiceScalarWhereInput
    data: XOR<InvoiceUpdateManyMutationInput, InvoiceUncheckedUpdateManyWithoutClientInput>
  }

  export type TenantCreateWithoutPackagesInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutTenantInput
    shoots?: ShootCreateNestedManyWithoutTenantInput
    shotLists?: ShotListCreateNestedManyWithoutTenantInput
    galleries?: GalleryCreateNestedManyWithoutTenantInput
    clients?: ClientCreateNestedManyWithoutTenantInput
    invoices?: InvoiceCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutPackagesInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutTenantInput
    shoots?: ShootUncheckedCreateNestedManyWithoutTenantInput
    shotLists?: ShotListUncheckedCreateNestedManyWithoutTenantInput
    galleries?: GalleryUncheckedCreateNestedManyWithoutTenantInput
    clients?: ClientUncheckedCreateNestedManyWithoutTenantInput
    invoices?: InvoiceUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutPackagesInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutPackagesInput, TenantUncheckedCreateWithoutPackagesInput>
  }

  export type ClientCreateWithoutPackagesInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    type?: string
    tags?: ClientCreatetagsInput | string[]
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutClientsInput
    invoices?: InvoiceCreateNestedManyWithoutClientInput
  }

  export type ClientUncheckedCreateWithoutPackagesInput = {
    id?: string
    tenantId: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    type?: string
    tags?: ClientCreatetagsInput | string[]
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    invoices?: InvoiceUncheckedCreateNestedManyWithoutClientInput
  }

  export type ClientCreateOrConnectWithoutPackagesInput = {
    where: ClientWhereUniqueInput
    create: XOR<ClientCreateWithoutPackagesInput, ClientUncheckedCreateWithoutPackagesInput>
  }

  export type ShootCreateWithoutPackageInput = {
    id?: string
    date: Date | string
    startTime: string
    endTime: string
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootCreatelocationsInput | InputJsonValue[]
    sunsetTime?: Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: string | null
    venueName?: string | null
    venueAddress?: string | null
    lightingNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutShootsInput
    shotList?: ShotListCreateNestedOneWithoutShootInput
    galleries?: GalleryCreateNestedManyWithoutShootInput
  }

  export type ShootUncheckedCreateWithoutPackageInput = {
    id?: string
    tenantId: string
    date: Date | string
    startTime: string
    endTime: string
    shotListId?: string | null
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootCreatelocationsInput | InputJsonValue[]
    sunsetTime?: Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: string | null
    venueName?: string | null
    venueAddress?: string | null
    lightingNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    galleries?: GalleryUncheckedCreateNestedManyWithoutShootInput
  }

  export type ShootCreateOrConnectWithoutPackageInput = {
    where: ShootWhereUniqueInput
    create: XOR<ShootCreateWithoutPackageInput, ShootUncheckedCreateWithoutPackageInput>
  }

  export type ShootCreateManyPackageInputEnvelope = {
    data: ShootCreateManyPackageInput | ShootCreateManyPackageInput[]
    skipDuplicates?: boolean
  }

  export type PackageAddonCreateWithoutPackageInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    quantity?: number
    createdAt?: Date | string
  }

  export type PackageAddonUncheckedCreateWithoutPackageInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    quantity?: number
    createdAt?: Date | string
  }

  export type PackageAddonCreateOrConnectWithoutPackageInput = {
    where: PackageAddonWhereUniqueInput
    create: XOR<PackageAddonCreateWithoutPackageInput, PackageAddonUncheckedCreateWithoutPackageInput>
  }

  export type PackageAddonCreateManyPackageInputEnvelope = {
    data: PackageAddonCreateManyPackageInput | PackageAddonCreateManyPackageInput[]
    skipDuplicates?: boolean
  }

  export type InvoiceCreateWithoutPackageInput = {
    id?: string
    invoiceNumber: string
    status?: $Enums.InvoiceStatus
    items: JsonNullValueInput | InputJsonValue
    subtotal: number
    tax?: number
    total: number
    dueDate?: Date | string | null
    paidAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutInvoicesInput
    client: ClientCreateNestedOneWithoutInvoicesInput
  }

  export type InvoiceUncheckedCreateWithoutPackageInput = {
    id?: string
    tenantId: string
    clientId: string
    invoiceNumber: string
    status?: $Enums.InvoiceStatus
    items: JsonNullValueInput | InputJsonValue
    subtotal: number
    tax?: number
    total: number
    dueDate?: Date | string | null
    paidAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InvoiceCreateOrConnectWithoutPackageInput = {
    where: InvoiceWhereUniqueInput
    create: XOR<InvoiceCreateWithoutPackageInput, InvoiceUncheckedCreateWithoutPackageInput>
  }

  export type InvoiceCreateManyPackageInputEnvelope = {
    data: InvoiceCreateManyPackageInput | InvoiceCreateManyPackageInput[]
    skipDuplicates?: boolean
  }

  export type ShotListCreateWithoutPackageInput = {
    id?: string
    name: string
    status?: $Enums.ShotListStatus
    eventType: string
    aiGenerated?: boolean
    sections: JsonNullValueInput | InputJsonValue
    totalShots: number
    mustHaveCount: number
    estimatedTime?: number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutShotListsInput
    shoot?: ShootCreateNestedOneWithoutShotListInput
  }

  export type ShotListUncheckedCreateWithoutPackageInput = {
    id?: string
    tenantId: string
    name: string
    status?: $Enums.ShotListStatus
    eventType: string
    aiGenerated?: boolean
    sections: JsonNullValueInput | InputJsonValue
    totalShots: number
    mustHaveCount: number
    estimatedTime?: number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    shoot?: ShootUncheckedCreateNestedOneWithoutShotListInput
  }

  export type ShotListCreateOrConnectWithoutPackageInput = {
    where: ShotListWhereUniqueInput
    create: XOR<ShotListCreateWithoutPackageInput, ShotListUncheckedCreateWithoutPackageInput>
  }

  export type ShotListCreateManyPackageInputEnvelope = {
    data: ShotListCreateManyPackageInput | ShotListCreateManyPackageInput[]
    skipDuplicates?: boolean
  }

  export type TenantUpsertWithoutPackagesInput = {
    update: XOR<TenantUpdateWithoutPackagesInput, TenantUncheckedUpdateWithoutPackagesInput>
    create: XOR<TenantCreateWithoutPackagesInput, TenantUncheckedCreateWithoutPackagesInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutPackagesInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutPackagesInput, TenantUncheckedUpdateWithoutPackagesInput>
  }

  export type TenantUpdateWithoutPackagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutTenantNestedInput
    shoots?: ShootUpdateManyWithoutTenantNestedInput
    shotLists?: ShotListUpdateManyWithoutTenantNestedInput
    galleries?: GalleryUpdateManyWithoutTenantNestedInput
    clients?: ClientUpdateManyWithoutTenantNestedInput
    invoices?: InvoiceUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutPackagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutTenantNestedInput
    shoots?: ShootUncheckedUpdateManyWithoutTenantNestedInput
    shotLists?: ShotListUncheckedUpdateManyWithoutTenantNestedInput
    galleries?: GalleryUncheckedUpdateManyWithoutTenantNestedInput
    clients?: ClientUncheckedUpdateManyWithoutTenantNestedInput
    invoices?: InvoiceUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type ClientUpsertWithoutPackagesInput = {
    update: XOR<ClientUpdateWithoutPackagesInput, ClientUncheckedUpdateWithoutPackagesInput>
    create: XOR<ClientCreateWithoutPackagesInput, ClientUncheckedCreateWithoutPackagesInput>
    where?: ClientWhereInput
  }

  export type ClientUpdateToOneWithWhereWithoutPackagesInput = {
    where?: ClientWhereInput
    data: XOR<ClientUpdateWithoutPackagesInput, ClientUncheckedUpdateWithoutPackagesInput>
  }

  export type ClientUpdateWithoutPackagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    tags?: ClientUpdatetagsInput | string[]
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutClientsNestedInput
    invoices?: InvoiceUpdateManyWithoutClientNestedInput
  }

  export type ClientUncheckedUpdateWithoutPackagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    tags?: ClientUpdatetagsInput | string[]
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    invoices?: InvoiceUncheckedUpdateManyWithoutClientNestedInput
  }

  export type ShootUpsertWithWhereUniqueWithoutPackageInput = {
    where: ShootWhereUniqueInput
    update: XOR<ShootUpdateWithoutPackageInput, ShootUncheckedUpdateWithoutPackageInput>
    create: XOR<ShootCreateWithoutPackageInput, ShootUncheckedCreateWithoutPackageInput>
  }

  export type ShootUpdateWithWhereUniqueWithoutPackageInput = {
    where: ShootWhereUniqueInput
    data: XOR<ShootUpdateWithoutPackageInput, ShootUncheckedUpdateWithoutPackageInput>
  }

  export type ShootUpdateManyWithWhereWithoutPackageInput = {
    where: ShootScalarWhereInput
    data: XOR<ShootUpdateManyMutationInput, ShootUncheckedUpdateManyWithoutPackageInput>
  }

  export type PackageAddonUpsertWithWhereUniqueWithoutPackageInput = {
    where: PackageAddonWhereUniqueInput
    update: XOR<PackageAddonUpdateWithoutPackageInput, PackageAddonUncheckedUpdateWithoutPackageInput>
    create: XOR<PackageAddonCreateWithoutPackageInput, PackageAddonUncheckedCreateWithoutPackageInput>
  }

  export type PackageAddonUpdateWithWhereUniqueWithoutPackageInput = {
    where: PackageAddonWhereUniqueInput
    data: XOR<PackageAddonUpdateWithoutPackageInput, PackageAddonUncheckedUpdateWithoutPackageInput>
  }

  export type PackageAddonUpdateManyWithWhereWithoutPackageInput = {
    where: PackageAddonScalarWhereInput
    data: XOR<PackageAddonUpdateManyMutationInput, PackageAddonUncheckedUpdateManyWithoutPackageInput>
  }

  export type PackageAddonScalarWhereInput = {
    AND?: PackageAddonScalarWhereInput | PackageAddonScalarWhereInput[]
    OR?: PackageAddonScalarWhereInput[]
    NOT?: PackageAddonScalarWhereInput | PackageAddonScalarWhereInput[]
    id?: StringFilter<"PackageAddon"> | string
    packageId?: StringFilter<"PackageAddon"> | string
    name?: StringFilter<"PackageAddon"> | string
    description?: StringNullableFilter<"PackageAddon"> | string | null
    price?: IntFilter<"PackageAddon"> | number
    quantity?: IntFilter<"PackageAddon"> | number
    createdAt?: DateTimeFilter<"PackageAddon"> | Date | string
  }

  export type InvoiceUpsertWithWhereUniqueWithoutPackageInput = {
    where: InvoiceWhereUniqueInput
    update: XOR<InvoiceUpdateWithoutPackageInput, InvoiceUncheckedUpdateWithoutPackageInput>
    create: XOR<InvoiceCreateWithoutPackageInput, InvoiceUncheckedCreateWithoutPackageInput>
  }

  export type InvoiceUpdateWithWhereUniqueWithoutPackageInput = {
    where: InvoiceWhereUniqueInput
    data: XOR<InvoiceUpdateWithoutPackageInput, InvoiceUncheckedUpdateWithoutPackageInput>
  }

  export type InvoiceUpdateManyWithWhereWithoutPackageInput = {
    where: InvoiceScalarWhereInput
    data: XOR<InvoiceUpdateManyMutationInput, InvoiceUncheckedUpdateManyWithoutPackageInput>
  }

  export type ShotListUpsertWithWhereUniqueWithoutPackageInput = {
    where: ShotListWhereUniqueInput
    update: XOR<ShotListUpdateWithoutPackageInput, ShotListUncheckedUpdateWithoutPackageInput>
    create: XOR<ShotListCreateWithoutPackageInput, ShotListUncheckedCreateWithoutPackageInput>
  }

  export type ShotListUpdateWithWhereUniqueWithoutPackageInput = {
    where: ShotListWhereUniqueInput
    data: XOR<ShotListUpdateWithoutPackageInput, ShotListUncheckedUpdateWithoutPackageInput>
  }

  export type ShotListUpdateManyWithWhereWithoutPackageInput = {
    where: ShotListScalarWhereInput
    data: XOR<ShotListUpdateManyMutationInput, ShotListUncheckedUpdateManyWithoutPackageInput>
  }

  export type PackageCreateWithoutAddonsInput = {
    id?: string
    title: string
    status?: $Enums.PackageStatus
    eventType?: string | null
    eventDate?: Date | string | null
    shotCount?: number | null
    deliveryDays?: number | null
    galleryUrl?: string | null
    editingHours?: number | null
    styleTags?: PackageCreatestyleTagsInput | string[]
    equipment?: PackageCreateequipmentInput | string[]
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: number | null
    travelCosts?: number | null
    totalPrice?: number | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutPackagesInput
    client: ClientCreateNestedOneWithoutPackagesInput
    shoots?: ShootCreateNestedManyWithoutPackageInput
    invoices?: InvoiceCreateNestedManyWithoutPackageInput
    shotLists?: ShotListCreateNestedManyWithoutPackageInput
  }

  export type PackageUncheckedCreateWithoutAddonsInput = {
    id?: string
    tenantId: string
    clientId: string
    title: string
    status?: $Enums.PackageStatus
    eventType?: string | null
    eventDate?: Date | string | null
    shotCount?: number | null
    deliveryDays?: number | null
    galleryUrl?: string | null
    editingHours?: number | null
    styleTags?: PackageCreatestyleTagsInput | string[]
    equipment?: PackageCreateequipmentInput | string[]
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: number | null
    travelCosts?: number | null
    totalPrice?: number | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    shoots?: ShootUncheckedCreateNestedManyWithoutPackageInput
    invoices?: InvoiceUncheckedCreateNestedManyWithoutPackageInput
    shotLists?: ShotListUncheckedCreateNestedManyWithoutPackageInput
  }

  export type PackageCreateOrConnectWithoutAddonsInput = {
    where: PackageWhereUniqueInput
    create: XOR<PackageCreateWithoutAddonsInput, PackageUncheckedCreateWithoutAddonsInput>
  }

  export type PackageUpsertWithoutAddonsInput = {
    update: XOR<PackageUpdateWithoutAddonsInput, PackageUncheckedUpdateWithoutAddonsInput>
    create: XOR<PackageCreateWithoutAddonsInput, PackageUncheckedCreateWithoutAddonsInput>
    where?: PackageWhereInput
  }

  export type PackageUpdateToOneWithWhereWithoutAddonsInput = {
    where?: PackageWhereInput
    data: XOR<PackageUpdateWithoutAddonsInput, PackageUncheckedUpdateWithoutAddonsInput>
  }

  export type PackageUpdateWithoutAddonsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutPackagesNestedInput
    client?: ClientUpdateOneRequiredWithoutPackagesNestedInput
    shoots?: ShootUpdateManyWithoutPackageNestedInput
    invoices?: InvoiceUpdateManyWithoutPackageNestedInput
    shotLists?: ShotListUpdateManyWithoutPackageNestedInput
  }

  export type PackageUncheckedUpdateWithoutAddonsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shoots?: ShootUncheckedUpdateManyWithoutPackageNestedInput
    invoices?: InvoiceUncheckedUpdateManyWithoutPackageNestedInput
    shotLists?: ShotListUncheckedUpdateManyWithoutPackageNestedInput
  }

  export type TenantCreateWithoutShootsInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutTenantInput
    packages?: PackageCreateNestedManyWithoutTenantInput
    shotLists?: ShotListCreateNestedManyWithoutTenantInput
    galleries?: GalleryCreateNestedManyWithoutTenantInput
    clients?: ClientCreateNestedManyWithoutTenantInput
    invoices?: InvoiceCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutShootsInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutTenantInput
    packages?: PackageUncheckedCreateNestedManyWithoutTenantInput
    shotLists?: ShotListUncheckedCreateNestedManyWithoutTenantInput
    galleries?: GalleryUncheckedCreateNestedManyWithoutTenantInput
    clients?: ClientUncheckedCreateNestedManyWithoutTenantInput
    invoices?: InvoiceUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutShootsInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutShootsInput, TenantUncheckedCreateWithoutShootsInput>
  }

  export type PackageCreateWithoutShootsInput = {
    id?: string
    title: string
    status?: $Enums.PackageStatus
    eventType?: string | null
    eventDate?: Date | string | null
    shotCount?: number | null
    deliveryDays?: number | null
    galleryUrl?: string | null
    editingHours?: number | null
    styleTags?: PackageCreatestyleTagsInput | string[]
    equipment?: PackageCreateequipmentInput | string[]
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: number | null
    travelCosts?: number | null
    totalPrice?: number | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutPackagesInput
    client: ClientCreateNestedOneWithoutPackagesInput
    addons?: PackageAddonCreateNestedManyWithoutPackageInput
    invoices?: InvoiceCreateNestedManyWithoutPackageInput
    shotLists?: ShotListCreateNestedManyWithoutPackageInput
  }

  export type PackageUncheckedCreateWithoutShootsInput = {
    id?: string
    tenantId: string
    clientId: string
    title: string
    status?: $Enums.PackageStatus
    eventType?: string | null
    eventDate?: Date | string | null
    shotCount?: number | null
    deliveryDays?: number | null
    galleryUrl?: string | null
    editingHours?: number | null
    styleTags?: PackageCreatestyleTagsInput | string[]
    equipment?: PackageCreateequipmentInput | string[]
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: number | null
    travelCosts?: number | null
    totalPrice?: number | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    addons?: PackageAddonUncheckedCreateNestedManyWithoutPackageInput
    invoices?: InvoiceUncheckedCreateNestedManyWithoutPackageInput
    shotLists?: ShotListUncheckedCreateNestedManyWithoutPackageInput
  }

  export type PackageCreateOrConnectWithoutShootsInput = {
    where: PackageWhereUniqueInput
    create: XOR<PackageCreateWithoutShootsInput, PackageUncheckedCreateWithoutShootsInput>
  }

  export type ShotListCreateWithoutShootInput = {
    id?: string
    name: string
    status?: $Enums.ShotListStatus
    eventType: string
    aiGenerated?: boolean
    sections: JsonNullValueInput | InputJsonValue
    totalShots: number
    mustHaveCount: number
    estimatedTime?: number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutShotListsInput
    package?: PackageCreateNestedOneWithoutShotListsInput
  }

  export type ShotListUncheckedCreateWithoutShootInput = {
    id?: string
    tenantId: string
    packageId?: string | null
    name: string
    status?: $Enums.ShotListStatus
    eventType: string
    aiGenerated?: boolean
    sections: JsonNullValueInput | InputJsonValue
    totalShots: number
    mustHaveCount: number
    estimatedTime?: number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ShotListCreateOrConnectWithoutShootInput = {
    where: ShotListWhereUniqueInput
    create: XOR<ShotListCreateWithoutShootInput, ShotListUncheckedCreateWithoutShootInput>
  }

  export type GalleryCreateWithoutShootInput = {
    id?: string
    name: string
    status?: $Enums.GalleryStatus
    totalPhotos?: number
    selectedPhotos?: number
    aiCurated?: boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: string | null
    password?: string | null
    expiresAt?: Date | string | null
    downloadEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutGalleriesInput
    photos?: GalleryPhotoCreateNestedManyWithoutGalleryInput
  }

  export type GalleryUncheckedCreateWithoutShootInput = {
    id?: string
    tenantId: string
    name: string
    status?: $Enums.GalleryStatus
    totalPhotos?: number
    selectedPhotos?: number
    aiCurated?: boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: string | null
    password?: string | null
    expiresAt?: Date | string | null
    downloadEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    photos?: GalleryPhotoUncheckedCreateNestedManyWithoutGalleryInput
  }

  export type GalleryCreateOrConnectWithoutShootInput = {
    where: GalleryWhereUniqueInput
    create: XOR<GalleryCreateWithoutShootInput, GalleryUncheckedCreateWithoutShootInput>
  }

  export type GalleryCreateManyShootInputEnvelope = {
    data: GalleryCreateManyShootInput | GalleryCreateManyShootInput[]
    skipDuplicates?: boolean
  }

  export type TenantUpsertWithoutShootsInput = {
    update: XOR<TenantUpdateWithoutShootsInput, TenantUncheckedUpdateWithoutShootsInput>
    create: XOR<TenantCreateWithoutShootsInput, TenantUncheckedCreateWithoutShootsInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutShootsInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutShootsInput, TenantUncheckedUpdateWithoutShootsInput>
  }

  export type TenantUpdateWithoutShootsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutTenantNestedInput
    packages?: PackageUpdateManyWithoutTenantNestedInput
    shotLists?: ShotListUpdateManyWithoutTenantNestedInput
    galleries?: GalleryUpdateManyWithoutTenantNestedInput
    clients?: ClientUpdateManyWithoutTenantNestedInput
    invoices?: InvoiceUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutShootsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutTenantNestedInput
    packages?: PackageUncheckedUpdateManyWithoutTenantNestedInput
    shotLists?: ShotListUncheckedUpdateManyWithoutTenantNestedInput
    galleries?: GalleryUncheckedUpdateManyWithoutTenantNestedInput
    clients?: ClientUncheckedUpdateManyWithoutTenantNestedInput
    invoices?: InvoiceUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type PackageUpsertWithoutShootsInput = {
    update: XOR<PackageUpdateWithoutShootsInput, PackageUncheckedUpdateWithoutShootsInput>
    create: XOR<PackageCreateWithoutShootsInput, PackageUncheckedCreateWithoutShootsInput>
    where?: PackageWhereInput
  }

  export type PackageUpdateToOneWithWhereWithoutShootsInput = {
    where?: PackageWhereInput
    data: XOR<PackageUpdateWithoutShootsInput, PackageUncheckedUpdateWithoutShootsInput>
  }

  export type PackageUpdateWithoutShootsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutPackagesNestedInput
    client?: ClientUpdateOneRequiredWithoutPackagesNestedInput
    addons?: PackageAddonUpdateManyWithoutPackageNestedInput
    invoices?: InvoiceUpdateManyWithoutPackageNestedInput
    shotLists?: ShotListUpdateManyWithoutPackageNestedInput
  }

  export type PackageUncheckedUpdateWithoutShootsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    addons?: PackageAddonUncheckedUpdateManyWithoutPackageNestedInput
    invoices?: InvoiceUncheckedUpdateManyWithoutPackageNestedInput
    shotLists?: ShotListUncheckedUpdateManyWithoutPackageNestedInput
  }

  export type ShotListUpsertWithoutShootInput = {
    update: XOR<ShotListUpdateWithoutShootInput, ShotListUncheckedUpdateWithoutShootInput>
    create: XOR<ShotListCreateWithoutShootInput, ShotListUncheckedCreateWithoutShootInput>
    where?: ShotListWhereInput
  }

  export type ShotListUpdateToOneWithWhereWithoutShootInput = {
    where?: ShotListWhereInput
    data: XOR<ShotListUpdateWithoutShootInput, ShotListUncheckedUpdateWithoutShootInput>
  }

  export type ShotListUpdateWithoutShootInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumShotListStatusFieldUpdateOperationsInput | $Enums.ShotListStatus
    eventType?: StringFieldUpdateOperationsInput | string
    aiGenerated?: BoolFieldUpdateOperationsInput | boolean
    sections?: JsonNullValueInput | InputJsonValue
    totalShots?: IntFieldUpdateOperationsInput | number
    mustHaveCount?: IntFieldUpdateOperationsInput | number
    estimatedTime?: NullableIntFieldUpdateOperationsInput | number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutShotListsNestedInput
    package?: PackageUpdateOneWithoutShotListsNestedInput
  }

  export type ShotListUncheckedUpdateWithoutShootInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    packageId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumShotListStatusFieldUpdateOperationsInput | $Enums.ShotListStatus
    eventType?: StringFieldUpdateOperationsInput | string
    aiGenerated?: BoolFieldUpdateOperationsInput | boolean
    sections?: JsonNullValueInput | InputJsonValue
    totalShots?: IntFieldUpdateOperationsInput | number
    mustHaveCount?: IntFieldUpdateOperationsInput | number
    estimatedTime?: NullableIntFieldUpdateOperationsInput | number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GalleryUpsertWithWhereUniqueWithoutShootInput = {
    where: GalleryWhereUniqueInput
    update: XOR<GalleryUpdateWithoutShootInput, GalleryUncheckedUpdateWithoutShootInput>
    create: XOR<GalleryCreateWithoutShootInput, GalleryUncheckedCreateWithoutShootInput>
  }

  export type GalleryUpdateWithWhereUniqueWithoutShootInput = {
    where: GalleryWhereUniqueInput
    data: XOR<GalleryUpdateWithoutShootInput, GalleryUncheckedUpdateWithoutShootInput>
  }

  export type GalleryUpdateManyWithWhereWithoutShootInput = {
    where: GalleryScalarWhereInput
    data: XOR<GalleryUpdateManyMutationInput, GalleryUncheckedUpdateManyWithoutShootInput>
  }

  export type TenantCreateWithoutShotListsInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutTenantInput
    packages?: PackageCreateNestedManyWithoutTenantInput
    shoots?: ShootCreateNestedManyWithoutTenantInput
    galleries?: GalleryCreateNestedManyWithoutTenantInput
    clients?: ClientCreateNestedManyWithoutTenantInput
    invoices?: InvoiceCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutShotListsInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutTenantInput
    packages?: PackageUncheckedCreateNestedManyWithoutTenantInput
    shoots?: ShootUncheckedCreateNestedManyWithoutTenantInput
    galleries?: GalleryUncheckedCreateNestedManyWithoutTenantInput
    clients?: ClientUncheckedCreateNestedManyWithoutTenantInput
    invoices?: InvoiceUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutShotListsInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutShotListsInput, TenantUncheckedCreateWithoutShotListsInput>
  }

  export type PackageCreateWithoutShotListsInput = {
    id?: string
    title: string
    status?: $Enums.PackageStatus
    eventType?: string | null
    eventDate?: Date | string | null
    shotCount?: number | null
    deliveryDays?: number | null
    galleryUrl?: string | null
    editingHours?: number | null
    styleTags?: PackageCreatestyleTagsInput | string[]
    equipment?: PackageCreateequipmentInput | string[]
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: number | null
    travelCosts?: number | null
    totalPrice?: number | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutPackagesInput
    client: ClientCreateNestedOneWithoutPackagesInput
    shoots?: ShootCreateNestedManyWithoutPackageInput
    addons?: PackageAddonCreateNestedManyWithoutPackageInput
    invoices?: InvoiceCreateNestedManyWithoutPackageInput
  }

  export type PackageUncheckedCreateWithoutShotListsInput = {
    id?: string
    tenantId: string
    clientId: string
    title: string
    status?: $Enums.PackageStatus
    eventType?: string | null
    eventDate?: Date | string | null
    shotCount?: number | null
    deliveryDays?: number | null
    galleryUrl?: string | null
    editingHours?: number | null
    styleTags?: PackageCreatestyleTagsInput | string[]
    equipment?: PackageCreateequipmentInput | string[]
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: number | null
    travelCosts?: number | null
    totalPrice?: number | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    shoots?: ShootUncheckedCreateNestedManyWithoutPackageInput
    addons?: PackageAddonUncheckedCreateNestedManyWithoutPackageInput
    invoices?: InvoiceUncheckedCreateNestedManyWithoutPackageInput
  }

  export type PackageCreateOrConnectWithoutShotListsInput = {
    where: PackageWhereUniqueInput
    create: XOR<PackageCreateWithoutShotListsInput, PackageUncheckedCreateWithoutShotListsInput>
  }

  export type ShootCreateWithoutShotListInput = {
    id?: string
    date: Date | string
    startTime: string
    endTime: string
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootCreatelocationsInput | InputJsonValue[]
    sunsetTime?: Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: string | null
    venueName?: string | null
    venueAddress?: string | null
    lightingNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutShootsInput
    package: PackageCreateNestedOneWithoutShootsInput
    galleries?: GalleryCreateNestedManyWithoutShootInput
  }

  export type ShootUncheckedCreateWithoutShotListInput = {
    id?: string
    tenantId: string
    packageId: string
    date: Date | string
    startTime: string
    endTime: string
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootCreatelocationsInput | InputJsonValue[]
    sunsetTime?: Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: string | null
    venueName?: string | null
    venueAddress?: string | null
    lightingNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    galleries?: GalleryUncheckedCreateNestedManyWithoutShootInput
  }

  export type ShootCreateOrConnectWithoutShotListInput = {
    where: ShootWhereUniqueInput
    create: XOR<ShootCreateWithoutShotListInput, ShootUncheckedCreateWithoutShotListInput>
  }

  export type TenantUpsertWithoutShotListsInput = {
    update: XOR<TenantUpdateWithoutShotListsInput, TenantUncheckedUpdateWithoutShotListsInput>
    create: XOR<TenantCreateWithoutShotListsInput, TenantUncheckedCreateWithoutShotListsInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutShotListsInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutShotListsInput, TenantUncheckedUpdateWithoutShotListsInput>
  }

  export type TenantUpdateWithoutShotListsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutTenantNestedInput
    packages?: PackageUpdateManyWithoutTenantNestedInput
    shoots?: ShootUpdateManyWithoutTenantNestedInput
    galleries?: GalleryUpdateManyWithoutTenantNestedInput
    clients?: ClientUpdateManyWithoutTenantNestedInput
    invoices?: InvoiceUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutShotListsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutTenantNestedInput
    packages?: PackageUncheckedUpdateManyWithoutTenantNestedInput
    shoots?: ShootUncheckedUpdateManyWithoutTenantNestedInput
    galleries?: GalleryUncheckedUpdateManyWithoutTenantNestedInput
    clients?: ClientUncheckedUpdateManyWithoutTenantNestedInput
    invoices?: InvoiceUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type PackageUpsertWithoutShotListsInput = {
    update: XOR<PackageUpdateWithoutShotListsInput, PackageUncheckedUpdateWithoutShotListsInput>
    create: XOR<PackageCreateWithoutShotListsInput, PackageUncheckedCreateWithoutShotListsInput>
    where?: PackageWhereInput
  }

  export type PackageUpdateToOneWithWhereWithoutShotListsInput = {
    where?: PackageWhereInput
    data: XOR<PackageUpdateWithoutShotListsInput, PackageUncheckedUpdateWithoutShotListsInput>
  }

  export type PackageUpdateWithoutShotListsInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutPackagesNestedInput
    client?: ClientUpdateOneRequiredWithoutPackagesNestedInput
    shoots?: ShootUpdateManyWithoutPackageNestedInput
    addons?: PackageAddonUpdateManyWithoutPackageNestedInput
    invoices?: InvoiceUpdateManyWithoutPackageNestedInput
  }

  export type PackageUncheckedUpdateWithoutShotListsInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shoots?: ShootUncheckedUpdateManyWithoutPackageNestedInput
    addons?: PackageAddonUncheckedUpdateManyWithoutPackageNestedInput
    invoices?: InvoiceUncheckedUpdateManyWithoutPackageNestedInput
  }

  export type ShootUpsertWithoutShotListInput = {
    update: XOR<ShootUpdateWithoutShotListInput, ShootUncheckedUpdateWithoutShotListInput>
    create: XOR<ShootCreateWithoutShotListInput, ShootUncheckedCreateWithoutShotListInput>
    where?: ShootWhereInput
  }

  export type ShootUpdateToOneWithWhereWithoutShotListInput = {
    where?: ShootWhereInput
    data: XOR<ShootUpdateWithoutShotListInput, ShootUncheckedUpdateWithoutShotListInput>
  }

  export type ShootUpdateWithoutShotListInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootUpdatelocationsInput | InputJsonValue[]
    sunsetTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: NullableStringFieldUpdateOperationsInput | string | null
    venueName?: NullableStringFieldUpdateOperationsInput | string | null
    venueAddress?: NullableStringFieldUpdateOperationsInput | string | null
    lightingNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutShootsNestedInput
    package?: PackageUpdateOneRequiredWithoutShootsNestedInput
    galleries?: GalleryUpdateManyWithoutShootNestedInput
  }

  export type ShootUncheckedUpdateWithoutShotListInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    packageId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootUpdatelocationsInput | InputJsonValue[]
    sunsetTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: NullableStringFieldUpdateOperationsInput | string | null
    venueName?: NullableStringFieldUpdateOperationsInput | string | null
    venueAddress?: NullableStringFieldUpdateOperationsInput | string | null
    lightingNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    galleries?: GalleryUncheckedUpdateManyWithoutShootNestedInput
  }

  export type TenantCreateWithoutGalleriesInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutTenantInput
    packages?: PackageCreateNestedManyWithoutTenantInput
    shoots?: ShootCreateNestedManyWithoutTenantInput
    shotLists?: ShotListCreateNestedManyWithoutTenantInput
    clients?: ClientCreateNestedManyWithoutTenantInput
    invoices?: InvoiceCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutGalleriesInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutTenantInput
    packages?: PackageUncheckedCreateNestedManyWithoutTenantInput
    shoots?: ShootUncheckedCreateNestedManyWithoutTenantInput
    shotLists?: ShotListUncheckedCreateNestedManyWithoutTenantInput
    clients?: ClientUncheckedCreateNestedManyWithoutTenantInput
    invoices?: InvoiceUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutGalleriesInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutGalleriesInput, TenantUncheckedCreateWithoutGalleriesInput>
  }

  export type ShootCreateWithoutGalleriesInput = {
    id?: string
    date: Date | string
    startTime: string
    endTime: string
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootCreatelocationsInput | InputJsonValue[]
    sunsetTime?: Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: string | null
    venueName?: string | null
    venueAddress?: string | null
    lightingNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutShootsInput
    package: PackageCreateNestedOneWithoutShootsInput
    shotList?: ShotListCreateNestedOneWithoutShootInput
  }

  export type ShootUncheckedCreateWithoutGalleriesInput = {
    id?: string
    tenantId: string
    packageId: string
    date: Date | string
    startTime: string
    endTime: string
    shotListId?: string | null
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootCreatelocationsInput | InputJsonValue[]
    sunsetTime?: Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: string | null
    venueName?: string | null
    venueAddress?: string | null
    lightingNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ShootCreateOrConnectWithoutGalleriesInput = {
    where: ShootWhereUniqueInput
    create: XOR<ShootCreateWithoutGalleriesInput, ShootUncheckedCreateWithoutGalleriesInput>
  }

  export type GalleryPhotoCreateWithoutGalleryInput = {
    id?: string
    filename: string
    url: string
    thumbnailUrl?: string | null
    qualityScore?: number | null
    category?: string | null
    isHighlight?: boolean
    aiReasoning?: string | null
    technicalQuality?: NullableJsonNullValueInput | InputJsonValue
    emotionalImpact?: number | null
    takenAt?: Date | string | null
    camera?: string | null
    lens?: string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    selected?: boolean
    rejected?: boolean
    rejectionReason?: string | null
    createdAt?: Date | string
  }

  export type GalleryPhotoUncheckedCreateWithoutGalleryInput = {
    id?: string
    filename: string
    url: string
    thumbnailUrl?: string | null
    qualityScore?: number | null
    category?: string | null
    isHighlight?: boolean
    aiReasoning?: string | null
    technicalQuality?: NullableJsonNullValueInput | InputJsonValue
    emotionalImpact?: number | null
    takenAt?: Date | string | null
    camera?: string | null
    lens?: string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    selected?: boolean
    rejected?: boolean
    rejectionReason?: string | null
    createdAt?: Date | string
  }

  export type GalleryPhotoCreateOrConnectWithoutGalleryInput = {
    where: GalleryPhotoWhereUniqueInput
    create: XOR<GalleryPhotoCreateWithoutGalleryInput, GalleryPhotoUncheckedCreateWithoutGalleryInput>
  }

  export type GalleryPhotoCreateManyGalleryInputEnvelope = {
    data: GalleryPhotoCreateManyGalleryInput | GalleryPhotoCreateManyGalleryInput[]
    skipDuplicates?: boolean
  }

  export type TenantUpsertWithoutGalleriesInput = {
    update: XOR<TenantUpdateWithoutGalleriesInput, TenantUncheckedUpdateWithoutGalleriesInput>
    create: XOR<TenantCreateWithoutGalleriesInput, TenantUncheckedCreateWithoutGalleriesInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutGalleriesInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutGalleriesInput, TenantUncheckedUpdateWithoutGalleriesInput>
  }

  export type TenantUpdateWithoutGalleriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutTenantNestedInput
    packages?: PackageUpdateManyWithoutTenantNestedInput
    shoots?: ShootUpdateManyWithoutTenantNestedInput
    shotLists?: ShotListUpdateManyWithoutTenantNestedInput
    clients?: ClientUpdateManyWithoutTenantNestedInput
    invoices?: InvoiceUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutGalleriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutTenantNestedInput
    packages?: PackageUncheckedUpdateManyWithoutTenantNestedInput
    shoots?: ShootUncheckedUpdateManyWithoutTenantNestedInput
    shotLists?: ShotListUncheckedUpdateManyWithoutTenantNestedInput
    clients?: ClientUncheckedUpdateManyWithoutTenantNestedInput
    invoices?: InvoiceUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type ShootUpsertWithoutGalleriesInput = {
    update: XOR<ShootUpdateWithoutGalleriesInput, ShootUncheckedUpdateWithoutGalleriesInput>
    create: XOR<ShootCreateWithoutGalleriesInput, ShootUncheckedCreateWithoutGalleriesInput>
    where?: ShootWhereInput
  }

  export type ShootUpdateToOneWithWhereWithoutGalleriesInput = {
    where?: ShootWhereInput
    data: XOR<ShootUpdateWithoutGalleriesInput, ShootUncheckedUpdateWithoutGalleriesInput>
  }

  export type ShootUpdateWithoutGalleriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootUpdatelocationsInput | InputJsonValue[]
    sunsetTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: NullableStringFieldUpdateOperationsInput | string | null
    venueName?: NullableStringFieldUpdateOperationsInput | string | null
    venueAddress?: NullableStringFieldUpdateOperationsInput | string | null
    lightingNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutShootsNestedInput
    package?: PackageUpdateOneRequiredWithoutShootsNestedInput
    shotList?: ShotListUpdateOneWithoutShootNestedInput
  }

  export type ShootUncheckedUpdateWithoutGalleriesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    packageId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    shotListId?: NullableStringFieldUpdateOperationsInput | string | null
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootUpdatelocationsInput | InputJsonValue[]
    sunsetTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: NullableStringFieldUpdateOperationsInput | string | null
    venueName?: NullableStringFieldUpdateOperationsInput | string | null
    venueAddress?: NullableStringFieldUpdateOperationsInput | string | null
    lightingNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GalleryPhotoUpsertWithWhereUniqueWithoutGalleryInput = {
    where: GalleryPhotoWhereUniqueInput
    update: XOR<GalleryPhotoUpdateWithoutGalleryInput, GalleryPhotoUncheckedUpdateWithoutGalleryInput>
    create: XOR<GalleryPhotoCreateWithoutGalleryInput, GalleryPhotoUncheckedCreateWithoutGalleryInput>
  }

  export type GalleryPhotoUpdateWithWhereUniqueWithoutGalleryInput = {
    where: GalleryPhotoWhereUniqueInput
    data: XOR<GalleryPhotoUpdateWithoutGalleryInput, GalleryPhotoUncheckedUpdateWithoutGalleryInput>
  }

  export type GalleryPhotoUpdateManyWithWhereWithoutGalleryInput = {
    where: GalleryPhotoScalarWhereInput
    data: XOR<GalleryPhotoUpdateManyMutationInput, GalleryPhotoUncheckedUpdateManyWithoutGalleryInput>
  }

  export type GalleryPhotoScalarWhereInput = {
    AND?: GalleryPhotoScalarWhereInput | GalleryPhotoScalarWhereInput[]
    OR?: GalleryPhotoScalarWhereInput[]
    NOT?: GalleryPhotoScalarWhereInput | GalleryPhotoScalarWhereInput[]
    id?: StringFilter<"GalleryPhoto"> | string
    galleryId?: StringFilter<"GalleryPhoto"> | string
    filename?: StringFilter<"GalleryPhoto"> | string
    url?: StringFilter<"GalleryPhoto"> | string
    thumbnailUrl?: StringNullableFilter<"GalleryPhoto"> | string | null
    qualityScore?: FloatNullableFilter<"GalleryPhoto"> | number | null
    category?: StringNullableFilter<"GalleryPhoto"> | string | null
    isHighlight?: BoolFilter<"GalleryPhoto"> | boolean
    aiReasoning?: StringNullableFilter<"GalleryPhoto"> | string | null
    technicalQuality?: JsonNullableFilter<"GalleryPhoto">
    emotionalImpact?: FloatNullableFilter<"GalleryPhoto"> | number | null
    takenAt?: DateTimeNullableFilter<"GalleryPhoto"> | Date | string | null
    camera?: StringNullableFilter<"GalleryPhoto"> | string | null
    lens?: StringNullableFilter<"GalleryPhoto"> | string | null
    settings?: JsonNullableFilter<"GalleryPhoto">
    selected?: BoolFilter<"GalleryPhoto"> | boolean
    rejected?: BoolFilter<"GalleryPhoto"> | boolean
    rejectionReason?: StringNullableFilter<"GalleryPhoto"> | string | null
    createdAt?: DateTimeFilter<"GalleryPhoto"> | Date | string
  }

  export type GalleryCreateWithoutPhotosInput = {
    id?: string
    name: string
    status?: $Enums.GalleryStatus
    totalPhotos?: number
    selectedPhotos?: number
    aiCurated?: boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: string | null
    password?: string | null
    expiresAt?: Date | string | null
    downloadEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutGalleriesInput
    shoot: ShootCreateNestedOneWithoutGalleriesInput
  }

  export type GalleryUncheckedCreateWithoutPhotosInput = {
    id?: string
    tenantId: string
    shootId: string
    name: string
    status?: $Enums.GalleryStatus
    totalPhotos?: number
    selectedPhotos?: number
    aiCurated?: boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: string | null
    password?: string | null
    expiresAt?: Date | string | null
    downloadEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GalleryCreateOrConnectWithoutPhotosInput = {
    where: GalleryWhereUniqueInput
    create: XOR<GalleryCreateWithoutPhotosInput, GalleryUncheckedCreateWithoutPhotosInput>
  }

  export type GalleryUpsertWithoutPhotosInput = {
    update: XOR<GalleryUpdateWithoutPhotosInput, GalleryUncheckedUpdateWithoutPhotosInput>
    create: XOR<GalleryCreateWithoutPhotosInput, GalleryUncheckedCreateWithoutPhotosInput>
    where?: GalleryWhereInput
  }

  export type GalleryUpdateToOneWithWhereWithoutPhotosInput = {
    where?: GalleryWhereInput
    data: XOR<GalleryUpdateWithoutPhotosInput, GalleryUncheckedUpdateWithoutPhotosInput>
  }

  export type GalleryUpdateWithoutPhotosInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumGalleryStatusFieldUpdateOperationsInput | $Enums.GalleryStatus
    totalPhotos?: IntFieldUpdateOperationsInput | number
    selectedPhotos?: IntFieldUpdateOperationsInput | number
    aiCurated?: BoolFieldUpdateOperationsInput | boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    downloadEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutGalleriesNestedInput
    shoot?: ShootUpdateOneRequiredWithoutGalleriesNestedInput
  }

  export type GalleryUncheckedUpdateWithoutPhotosInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    shootId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumGalleryStatusFieldUpdateOperationsInput | $Enums.GalleryStatus
    totalPhotos?: IntFieldUpdateOperationsInput | number
    selectedPhotos?: IntFieldUpdateOperationsInput | number
    aiCurated?: BoolFieldUpdateOperationsInput | boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    downloadEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TenantCreateWithoutInvoicesInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserCreateNestedManyWithoutTenantInput
    packages?: PackageCreateNestedManyWithoutTenantInput
    shoots?: ShootCreateNestedManyWithoutTenantInput
    shotLists?: ShotListCreateNestedManyWithoutTenantInput
    galleries?: GalleryCreateNestedManyWithoutTenantInput
    clients?: ClientCreateNestedManyWithoutTenantInput
  }

  export type TenantUncheckedCreateWithoutInvoicesInput = {
    id?: string
    name: string
    slug: string
    plan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    users?: UserUncheckedCreateNestedManyWithoutTenantInput
    packages?: PackageUncheckedCreateNestedManyWithoutTenantInput
    shoots?: ShootUncheckedCreateNestedManyWithoutTenantInput
    shotLists?: ShotListUncheckedCreateNestedManyWithoutTenantInput
    galleries?: GalleryUncheckedCreateNestedManyWithoutTenantInput
    clients?: ClientUncheckedCreateNestedManyWithoutTenantInput
  }

  export type TenantCreateOrConnectWithoutInvoicesInput = {
    where: TenantWhereUniqueInput
    create: XOR<TenantCreateWithoutInvoicesInput, TenantUncheckedCreateWithoutInvoicesInput>
  }

  export type ClientCreateWithoutInvoicesInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    type?: string
    tags?: ClientCreatetagsInput | string[]
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutClientsInput
    packages?: PackageCreateNestedManyWithoutClientInput
  }

  export type ClientUncheckedCreateWithoutInvoicesInput = {
    id?: string
    tenantId: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    type?: string
    tags?: ClientCreatetagsInput | string[]
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    packages?: PackageUncheckedCreateNestedManyWithoutClientInput
  }

  export type ClientCreateOrConnectWithoutInvoicesInput = {
    where: ClientWhereUniqueInput
    create: XOR<ClientCreateWithoutInvoicesInput, ClientUncheckedCreateWithoutInvoicesInput>
  }

  export type PackageCreateWithoutInvoicesInput = {
    id?: string
    title: string
    status?: $Enums.PackageStatus
    eventType?: string | null
    eventDate?: Date | string | null
    shotCount?: number | null
    deliveryDays?: number | null
    galleryUrl?: string | null
    editingHours?: number | null
    styleTags?: PackageCreatestyleTagsInput | string[]
    equipment?: PackageCreateequipmentInput | string[]
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: number | null
    travelCosts?: number | null
    totalPrice?: number | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    tenant: TenantCreateNestedOneWithoutPackagesInput
    client: ClientCreateNestedOneWithoutPackagesInput
    shoots?: ShootCreateNestedManyWithoutPackageInput
    addons?: PackageAddonCreateNestedManyWithoutPackageInput
    shotLists?: ShotListCreateNestedManyWithoutPackageInput
  }

  export type PackageUncheckedCreateWithoutInvoicesInput = {
    id?: string
    tenantId: string
    clientId: string
    title: string
    status?: $Enums.PackageStatus
    eventType?: string | null
    eventDate?: Date | string | null
    shotCount?: number | null
    deliveryDays?: number | null
    galleryUrl?: string | null
    editingHours?: number | null
    styleTags?: PackageCreatestyleTagsInput | string[]
    equipment?: PackageCreateequipmentInput | string[]
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: number | null
    travelCosts?: number | null
    totalPrice?: number | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    shoots?: ShootUncheckedCreateNestedManyWithoutPackageInput
    addons?: PackageAddonUncheckedCreateNestedManyWithoutPackageInput
    shotLists?: ShotListUncheckedCreateNestedManyWithoutPackageInput
  }

  export type PackageCreateOrConnectWithoutInvoicesInput = {
    where: PackageWhereUniqueInput
    create: XOR<PackageCreateWithoutInvoicesInput, PackageUncheckedCreateWithoutInvoicesInput>
  }

  export type TenantUpsertWithoutInvoicesInput = {
    update: XOR<TenantUpdateWithoutInvoicesInput, TenantUncheckedUpdateWithoutInvoicesInput>
    create: XOR<TenantCreateWithoutInvoicesInput, TenantUncheckedCreateWithoutInvoicesInput>
    where?: TenantWhereInput
  }

  export type TenantUpdateToOneWithWhereWithoutInvoicesInput = {
    where?: TenantWhereInput
    data: XOR<TenantUpdateWithoutInvoicesInput, TenantUncheckedUpdateWithoutInvoicesInput>
  }

  export type TenantUpdateWithoutInvoicesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUpdateManyWithoutTenantNestedInput
    packages?: PackageUpdateManyWithoutTenantNestedInput
    shoots?: ShootUpdateManyWithoutTenantNestedInput
    shotLists?: ShotListUpdateManyWithoutTenantNestedInput
    galleries?: GalleryUpdateManyWithoutTenantNestedInput
    clients?: ClientUpdateManyWithoutTenantNestedInput
  }

  export type TenantUncheckedUpdateWithoutInvoicesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    plan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    users?: UserUncheckedUpdateManyWithoutTenantNestedInput
    packages?: PackageUncheckedUpdateManyWithoutTenantNestedInput
    shoots?: ShootUncheckedUpdateManyWithoutTenantNestedInput
    shotLists?: ShotListUncheckedUpdateManyWithoutTenantNestedInput
    galleries?: GalleryUncheckedUpdateManyWithoutTenantNestedInput
    clients?: ClientUncheckedUpdateManyWithoutTenantNestedInput
  }

  export type ClientUpsertWithoutInvoicesInput = {
    update: XOR<ClientUpdateWithoutInvoicesInput, ClientUncheckedUpdateWithoutInvoicesInput>
    create: XOR<ClientCreateWithoutInvoicesInput, ClientUncheckedCreateWithoutInvoicesInput>
    where?: ClientWhereInput
  }

  export type ClientUpdateToOneWithWhereWithoutInvoicesInput = {
    where?: ClientWhereInput
    data: XOR<ClientUpdateWithoutInvoicesInput, ClientUncheckedUpdateWithoutInvoicesInput>
  }

  export type ClientUpdateWithoutInvoicesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    tags?: ClientUpdatetagsInput | string[]
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutClientsNestedInput
    packages?: PackageUpdateManyWithoutClientNestedInput
  }

  export type ClientUncheckedUpdateWithoutInvoicesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    tags?: ClientUpdatetagsInput | string[]
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    packages?: PackageUncheckedUpdateManyWithoutClientNestedInput
  }

  export type PackageUpsertWithoutInvoicesInput = {
    update: XOR<PackageUpdateWithoutInvoicesInput, PackageUncheckedUpdateWithoutInvoicesInput>
    create: XOR<PackageCreateWithoutInvoicesInput, PackageUncheckedCreateWithoutInvoicesInput>
    where?: PackageWhereInput
  }

  export type PackageUpdateToOneWithWhereWithoutInvoicesInput = {
    where?: PackageWhereInput
    data: XOR<PackageUpdateWithoutInvoicesInput, PackageUncheckedUpdateWithoutInvoicesInput>
  }

  export type PackageUpdateWithoutInvoicesInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutPackagesNestedInput
    client?: ClientUpdateOneRequiredWithoutPackagesNestedInput
    shoots?: ShootUpdateManyWithoutPackageNestedInput
    addons?: PackageAddonUpdateManyWithoutPackageNestedInput
    shotLists?: ShotListUpdateManyWithoutPackageNestedInput
  }

  export type PackageUncheckedUpdateWithoutInvoicesInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shoots?: ShootUncheckedUpdateManyWithoutPackageNestedInput
    addons?: PackageAddonUncheckedUpdateManyWithoutPackageNestedInput
    shotLists?: ShotListUncheckedUpdateManyWithoutPackageNestedInput
  }

  export type UserCreateManyTenantInput = {
    id?: string
    email: string
    name?: string | null
    passwordHash: string
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PackageCreateManyTenantInput = {
    id?: string
    clientId: string
    title: string
    status?: $Enums.PackageStatus
    eventType?: string | null
    eventDate?: Date | string | null
    shotCount?: number | null
    deliveryDays?: number | null
    galleryUrl?: string | null
    editingHours?: number | null
    styleTags?: PackageCreatestyleTagsInput | string[]
    equipment?: PackageCreateequipmentInput | string[]
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: number | null
    travelCosts?: number | null
    totalPrice?: number | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ShootCreateManyTenantInput = {
    id?: string
    packageId: string
    date: Date | string
    startTime: string
    endTime: string
    shotListId?: string | null
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootCreatelocationsInput | InputJsonValue[]
    sunsetTime?: Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: string | null
    venueName?: string | null
    venueAddress?: string | null
    lightingNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ShotListCreateManyTenantInput = {
    id?: string
    packageId?: string | null
    name: string
    status?: $Enums.ShotListStatus
    eventType: string
    aiGenerated?: boolean
    sections: JsonNullValueInput | InputJsonValue
    totalShots: number
    mustHaveCount: number
    estimatedTime?: number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GalleryCreateManyTenantInput = {
    id?: string
    shootId: string
    name: string
    status?: $Enums.GalleryStatus
    totalPhotos?: number
    selectedPhotos?: number
    aiCurated?: boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: string | null
    password?: string | null
    expiresAt?: Date | string | null
    downloadEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ClientCreateManyTenantInput = {
    id?: string
    name: string
    email: string
    phone?: string | null
    address?: string | null
    type?: string
    tags?: ClientCreatetagsInput | string[]
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InvoiceCreateManyTenantInput = {
    id?: string
    clientId: string
    packageId?: string | null
    invoiceNumber: string
    status?: $Enums.InvoiceStatus
    items: JsonNullValueInput | InputJsonValue
    subtotal: number
    tax?: number
    total: number
    dueDate?: Date | string | null
    paidAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PackageUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    client?: ClientUpdateOneRequiredWithoutPackagesNestedInput
    shoots?: ShootUpdateManyWithoutPackageNestedInput
    addons?: PackageAddonUpdateManyWithoutPackageNestedInput
    invoices?: InvoiceUpdateManyWithoutPackageNestedInput
    shotLists?: ShotListUpdateManyWithoutPackageNestedInput
  }

  export type PackageUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shoots?: ShootUncheckedUpdateManyWithoutPackageNestedInput
    addons?: PackageAddonUncheckedUpdateManyWithoutPackageNestedInput
    invoices?: InvoiceUncheckedUpdateManyWithoutPackageNestedInput
    shotLists?: ShotListUncheckedUpdateManyWithoutPackageNestedInput
  }

  export type PackageUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShootUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootUpdatelocationsInput | InputJsonValue[]
    sunsetTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: NullableStringFieldUpdateOperationsInput | string | null
    venueName?: NullableStringFieldUpdateOperationsInput | string | null
    venueAddress?: NullableStringFieldUpdateOperationsInput | string | null
    lightingNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    package?: PackageUpdateOneRequiredWithoutShootsNestedInput
    shotList?: ShotListUpdateOneWithoutShootNestedInput
    galleries?: GalleryUpdateManyWithoutShootNestedInput
  }

  export type ShootUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    packageId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    shotListId?: NullableStringFieldUpdateOperationsInput | string | null
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootUpdatelocationsInput | InputJsonValue[]
    sunsetTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: NullableStringFieldUpdateOperationsInput | string | null
    venueName?: NullableStringFieldUpdateOperationsInput | string | null
    venueAddress?: NullableStringFieldUpdateOperationsInput | string | null
    lightingNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    galleries?: GalleryUncheckedUpdateManyWithoutShootNestedInput
  }

  export type ShootUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    packageId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    shotListId?: NullableStringFieldUpdateOperationsInput | string | null
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootUpdatelocationsInput | InputJsonValue[]
    sunsetTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: NullableStringFieldUpdateOperationsInput | string | null
    venueName?: NullableStringFieldUpdateOperationsInput | string | null
    venueAddress?: NullableStringFieldUpdateOperationsInput | string | null
    lightingNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShotListUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumShotListStatusFieldUpdateOperationsInput | $Enums.ShotListStatus
    eventType?: StringFieldUpdateOperationsInput | string
    aiGenerated?: BoolFieldUpdateOperationsInput | boolean
    sections?: JsonNullValueInput | InputJsonValue
    totalShots?: IntFieldUpdateOperationsInput | number
    mustHaveCount?: IntFieldUpdateOperationsInput | number
    estimatedTime?: NullableIntFieldUpdateOperationsInput | number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    package?: PackageUpdateOneWithoutShotListsNestedInput
    shoot?: ShootUpdateOneWithoutShotListNestedInput
  }

  export type ShotListUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    packageId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumShotListStatusFieldUpdateOperationsInput | $Enums.ShotListStatus
    eventType?: StringFieldUpdateOperationsInput | string
    aiGenerated?: BoolFieldUpdateOperationsInput | boolean
    sections?: JsonNullValueInput | InputJsonValue
    totalShots?: IntFieldUpdateOperationsInput | number
    mustHaveCount?: IntFieldUpdateOperationsInput | number
    estimatedTime?: NullableIntFieldUpdateOperationsInput | number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shoot?: ShootUncheckedUpdateOneWithoutShotListNestedInput
  }

  export type ShotListUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    packageId?: NullableStringFieldUpdateOperationsInput | string | null
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumShotListStatusFieldUpdateOperationsInput | $Enums.ShotListStatus
    eventType?: StringFieldUpdateOperationsInput | string
    aiGenerated?: BoolFieldUpdateOperationsInput | boolean
    sections?: JsonNullValueInput | InputJsonValue
    totalShots?: IntFieldUpdateOperationsInput | number
    mustHaveCount?: IntFieldUpdateOperationsInput | number
    estimatedTime?: NullableIntFieldUpdateOperationsInput | number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GalleryUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumGalleryStatusFieldUpdateOperationsInput | $Enums.GalleryStatus
    totalPhotos?: IntFieldUpdateOperationsInput | number
    selectedPhotos?: IntFieldUpdateOperationsInput | number
    aiCurated?: BoolFieldUpdateOperationsInput | boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    downloadEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shoot?: ShootUpdateOneRequiredWithoutGalleriesNestedInput
    photos?: GalleryPhotoUpdateManyWithoutGalleryNestedInput
  }

  export type GalleryUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    shootId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumGalleryStatusFieldUpdateOperationsInput | $Enums.GalleryStatus
    totalPhotos?: IntFieldUpdateOperationsInput | number
    selectedPhotos?: IntFieldUpdateOperationsInput | number
    aiCurated?: BoolFieldUpdateOperationsInput | boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    downloadEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    photos?: GalleryPhotoUncheckedUpdateManyWithoutGalleryNestedInput
  }

  export type GalleryUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    shootId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumGalleryStatusFieldUpdateOperationsInput | $Enums.GalleryStatus
    totalPhotos?: IntFieldUpdateOperationsInput | number
    selectedPhotos?: IntFieldUpdateOperationsInput | number
    aiCurated?: BoolFieldUpdateOperationsInput | boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    downloadEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClientUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    tags?: ClientUpdatetagsInput | string[]
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    packages?: PackageUpdateManyWithoutClientNestedInput
    invoices?: InvoiceUpdateManyWithoutClientNestedInput
  }

  export type ClientUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    tags?: ClientUpdatetagsInput | string[]
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    packages?: PackageUncheckedUpdateManyWithoutClientNestedInput
    invoices?: InvoiceUncheckedUpdateManyWithoutClientNestedInput
  }

  export type ClientUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    tags?: ClientUpdatetagsInput | string[]
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvoiceUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus
    items?: JsonNullValueInput | InputJsonValue
    subtotal?: IntFieldUpdateOperationsInput | number
    tax?: IntFieldUpdateOperationsInput | number
    total?: IntFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    client?: ClientUpdateOneRequiredWithoutInvoicesNestedInput
    package?: PackageUpdateOneWithoutInvoicesNestedInput
  }

  export type InvoiceUncheckedUpdateWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    packageId?: NullableStringFieldUpdateOperationsInput | string | null
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus
    items?: JsonNullValueInput | InputJsonValue
    subtotal?: IntFieldUpdateOperationsInput | number
    tax?: IntFieldUpdateOperationsInput | number
    total?: IntFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvoiceUncheckedUpdateManyWithoutTenantInput = {
    id?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    packageId?: NullableStringFieldUpdateOperationsInput | string | null
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus
    items?: JsonNullValueInput | InputJsonValue
    subtotal?: IntFieldUpdateOperationsInput | number
    tax?: IntFieldUpdateOperationsInput | number
    total?: IntFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PackageCreateManyClientInput = {
    id?: string
    tenantId: string
    title: string
    status?: $Enums.PackageStatus
    eventType?: string | null
    eventDate?: Date | string | null
    shotCount?: number | null
    deliveryDays?: number | null
    galleryUrl?: string | null
    editingHours?: number | null
    styleTags?: PackageCreatestyleTagsInput | string[]
    equipment?: PackageCreateequipmentInput | string[]
    secondShooter?: boolean
    rawFilesIncluded?: boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: number | null
    travelCosts?: number | null
    totalPrice?: number | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InvoiceCreateManyClientInput = {
    id?: string
    tenantId: string
    packageId?: string | null
    invoiceNumber: string
    status?: $Enums.InvoiceStatus
    items: JsonNullValueInput | InputJsonValue
    subtotal: number
    tax?: number
    total: number
    dueDate?: Date | string | null
    paidAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PackageUpdateWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutPackagesNestedInput
    shoots?: ShootUpdateManyWithoutPackageNestedInput
    addons?: PackageAddonUpdateManyWithoutPackageNestedInput
    invoices?: InvoiceUpdateManyWithoutPackageNestedInput
    shotLists?: ShotListUpdateManyWithoutPackageNestedInput
  }

  export type PackageUncheckedUpdateWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shoots?: ShootUncheckedUpdateManyWithoutPackageNestedInput
    addons?: PackageAddonUncheckedUpdateManyWithoutPackageNestedInput
    invoices?: InvoiceUncheckedUpdateManyWithoutPackageNestedInput
    shotLists?: ShotListUncheckedUpdateManyWithoutPackageNestedInput
  }

  export type PackageUncheckedUpdateManyWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    status?: EnumPackageStatusFieldUpdateOperationsInput | $Enums.PackageStatus
    eventType?: NullableStringFieldUpdateOperationsInput | string | null
    eventDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    shotCount?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    galleryUrl?: NullableStringFieldUpdateOperationsInput | string | null
    editingHours?: NullableFloatFieldUpdateOperationsInput | number | null
    styleTags?: PackageUpdatestyleTagsInput | string[]
    equipment?: PackageUpdateequipmentInput | string[]
    secondShooter?: BoolFieldUpdateOperationsInput | boolean
    rawFilesIncluded?: BoolFieldUpdateOperationsInput | boolean
    timeline?: NullableJsonNullValueInput | InputJsonValue
    basePrice?: NullableIntFieldUpdateOperationsInput | number | null
    travelCosts?: NullableIntFieldUpdateOperationsInput | number | null
    totalPrice?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvoiceUpdateWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus
    items?: JsonNullValueInput | InputJsonValue
    subtotal?: IntFieldUpdateOperationsInput | number
    tax?: IntFieldUpdateOperationsInput | number
    total?: IntFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutInvoicesNestedInput
    package?: PackageUpdateOneWithoutInvoicesNestedInput
  }

  export type InvoiceUncheckedUpdateWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    packageId?: NullableStringFieldUpdateOperationsInput | string | null
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus
    items?: JsonNullValueInput | InputJsonValue
    subtotal?: IntFieldUpdateOperationsInput | number
    tax?: IntFieldUpdateOperationsInput | number
    total?: IntFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvoiceUncheckedUpdateManyWithoutClientInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    packageId?: NullableStringFieldUpdateOperationsInput | string | null
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus
    items?: JsonNullValueInput | InputJsonValue
    subtotal?: IntFieldUpdateOperationsInput | number
    tax?: IntFieldUpdateOperationsInput | number
    total?: IntFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShootCreateManyPackageInput = {
    id?: string
    tenantId: string
    date: Date | string
    startTime: string
    endTime: string
    shotListId?: string | null
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootCreatelocationsInput | InputJsonValue[]
    sunsetTime?: Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: string | null
    venueName?: string | null
    venueAddress?: string | null
    lightingNotes?: string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PackageAddonCreateManyPackageInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    quantity?: number
    createdAt?: Date | string
  }

  export type InvoiceCreateManyPackageInput = {
    id?: string
    tenantId: string
    clientId: string
    invoiceNumber: string
    status?: $Enums.InvoiceStatus
    items: JsonNullValueInput | InputJsonValue
    subtotal: number
    tax?: number
    total: number
    dueDate?: Date | string | null
    paidAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ShotListCreateManyPackageInput = {
    id?: string
    tenantId: string
    name: string
    status?: $Enums.ShotListStatus
    eventType: string
    aiGenerated?: boolean
    sections: JsonNullValueInput | InputJsonValue
    totalShots: number
    mustHaveCount: number
    estimatedTime?: number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ShootUpdateWithoutPackageInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootUpdatelocationsInput | InputJsonValue[]
    sunsetTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: NullableStringFieldUpdateOperationsInput | string | null
    venueName?: NullableStringFieldUpdateOperationsInput | string | null
    venueAddress?: NullableStringFieldUpdateOperationsInput | string | null
    lightingNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutShootsNestedInput
    shotList?: ShotListUpdateOneWithoutShootNestedInput
    galleries?: GalleryUpdateManyWithoutShootNestedInput
  }

  export type ShootUncheckedUpdateWithoutPackageInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    shotListId?: NullableStringFieldUpdateOperationsInput | string | null
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootUpdatelocationsInput | InputJsonValue[]
    sunsetTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: NullableStringFieldUpdateOperationsInput | string | null
    venueName?: NullableStringFieldUpdateOperationsInput | string | null
    venueAddress?: NullableStringFieldUpdateOperationsInput | string | null
    lightingNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    galleries?: GalleryUncheckedUpdateManyWithoutShootNestedInput
  }

  export type ShootUncheckedUpdateManyWithoutPackageInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    startTime?: StringFieldUpdateOperationsInput | string
    endTime?: StringFieldUpdateOperationsInput | string
    shotListId?: NullableStringFieldUpdateOperationsInput | string | null
    timeline?: NullableJsonNullValueInput | InputJsonValue
    locations?: ShootUpdatelocationsInput | InputJsonValue[]
    sunsetTime?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    weatherForecast?: NullableJsonNullValueInput | InputJsonValue
    venueType?: NullableStringFieldUpdateOperationsInput | string | null
    venueName?: NullableStringFieldUpdateOperationsInput | string | null
    venueAddress?: NullableStringFieldUpdateOperationsInput | string | null
    lightingNotes?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PackageAddonUpdateWithoutPackageInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PackageAddonUncheckedUpdateWithoutPackageInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PackageAddonUncheckedUpdateManyWithoutPackageInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvoiceUpdateWithoutPackageInput = {
    id?: StringFieldUpdateOperationsInput | string
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus
    items?: JsonNullValueInput | InputJsonValue
    subtotal?: IntFieldUpdateOperationsInput | number
    tax?: IntFieldUpdateOperationsInput | number
    total?: IntFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutInvoicesNestedInput
    client?: ClientUpdateOneRequiredWithoutInvoicesNestedInput
  }

  export type InvoiceUncheckedUpdateWithoutPackageInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus
    items?: JsonNullValueInput | InputJsonValue
    subtotal?: IntFieldUpdateOperationsInput | number
    tax?: IntFieldUpdateOperationsInput | number
    total?: IntFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InvoiceUncheckedUpdateManyWithoutPackageInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    clientId?: StringFieldUpdateOperationsInput | string
    invoiceNumber?: StringFieldUpdateOperationsInput | string
    status?: EnumInvoiceStatusFieldUpdateOperationsInput | $Enums.InvoiceStatus
    items?: JsonNullValueInput | InputJsonValue
    subtotal?: IntFieldUpdateOperationsInput | number
    tax?: IntFieldUpdateOperationsInput | number
    total?: IntFieldUpdateOperationsInput | number
    dueDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ShotListUpdateWithoutPackageInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumShotListStatusFieldUpdateOperationsInput | $Enums.ShotListStatus
    eventType?: StringFieldUpdateOperationsInput | string
    aiGenerated?: BoolFieldUpdateOperationsInput | boolean
    sections?: JsonNullValueInput | InputJsonValue
    totalShots?: IntFieldUpdateOperationsInput | number
    mustHaveCount?: IntFieldUpdateOperationsInput | number
    estimatedTime?: NullableIntFieldUpdateOperationsInput | number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutShotListsNestedInput
    shoot?: ShootUpdateOneWithoutShotListNestedInput
  }

  export type ShotListUncheckedUpdateWithoutPackageInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumShotListStatusFieldUpdateOperationsInput | $Enums.ShotListStatus
    eventType?: StringFieldUpdateOperationsInput | string
    aiGenerated?: BoolFieldUpdateOperationsInput | boolean
    sections?: JsonNullValueInput | InputJsonValue
    totalShots?: IntFieldUpdateOperationsInput | number
    mustHaveCount?: IntFieldUpdateOperationsInput | number
    estimatedTime?: NullableIntFieldUpdateOperationsInput | number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    shoot?: ShootUncheckedUpdateOneWithoutShotListNestedInput
  }

  export type ShotListUncheckedUpdateManyWithoutPackageInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumShotListStatusFieldUpdateOperationsInput | $Enums.ShotListStatus
    eventType?: StringFieldUpdateOperationsInput | string
    aiGenerated?: BoolFieldUpdateOperationsInput | boolean
    sections?: JsonNullValueInput | InputJsonValue
    totalShots?: IntFieldUpdateOperationsInput | number
    mustHaveCount?: IntFieldUpdateOperationsInput | number
    estimatedTime?: NullableIntFieldUpdateOperationsInput | number | null
    equipmentList?: NullableJsonNullValueInput | InputJsonValue
    lightingPlan?: NullableJsonNullValueInput | InputJsonValue
    backupPlans?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GalleryCreateManyShootInput = {
    id?: string
    tenantId: string
    name: string
    status?: $Enums.GalleryStatus
    totalPhotos?: number
    selectedPhotos?: number
    aiCurated?: boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: string | null
    password?: string | null
    expiresAt?: Date | string | null
    downloadEnabled?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GalleryUpdateWithoutShootInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumGalleryStatusFieldUpdateOperationsInput | $Enums.GalleryStatus
    totalPhotos?: IntFieldUpdateOperationsInput | number
    selectedPhotos?: IntFieldUpdateOperationsInput | number
    aiCurated?: BoolFieldUpdateOperationsInput | boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    downloadEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tenant?: TenantUpdateOneRequiredWithoutGalleriesNestedInput
    photos?: GalleryPhotoUpdateManyWithoutGalleryNestedInput
  }

  export type GalleryUncheckedUpdateWithoutShootInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumGalleryStatusFieldUpdateOperationsInput | $Enums.GalleryStatus
    totalPhotos?: IntFieldUpdateOperationsInput | number
    selectedPhotos?: IntFieldUpdateOperationsInput | number
    aiCurated?: BoolFieldUpdateOperationsInput | boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    downloadEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    photos?: GalleryPhotoUncheckedUpdateManyWithoutGalleryNestedInput
  }

  export type GalleryUncheckedUpdateManyWithoutShootInput = {
    id?: StringFieldUpdateOperationsInput | string
    tenantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    status?: EnumGalleryStatusFieldUpdateOperationsInput | $Enums.GalleryStatus
    totalPhotos?: IntFieldUpdateOperationsInput | number
    selectedPhotos?: IntFieldUpdateOperationsInput | number
    aiCurated?: BoolFieldUpdateOperationsInput | boolean
    curationData?: NullableJsonNullValueInput | InputJsonValue
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    password?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    downloadEnabled?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GalleryPhotoCreateManyGalleryInput = {
    id?: string
    filename: string
    url: string
    thumbnailUrl?: string | null
    qualityScore?: number | null
    category?: string | null
    isHighlight?: boolean
    aiReasoning?: string | null
    technicalQuality?: NullableJsonNullValueInput | InputJsonValue
    emotionalImpact?: number | null
    takenAt?: Date | string | null
    camera?: string | null
    lens?: string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    selected?: boolean
    rejected?: boolean
    rejectionReason?: string | null
    createdAt?: Date | string
  }

  export type GalleryPhotoUpdateWithoutGalleryInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    qualityScore?: NullableFloatFieldUpdateOperationsInput | number | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    isHighlight?: BoolFieldUpdateOperationsInput | boolean
    aiReasoning?: NullableStringFieldUpdateOperationsInput | string | null
    technicalQuality?: NullableJsonNullValueInput | InputJsonValue
    emotionalImpact?: NullableFloatFieldUpdateOperationsInput | number | null
    takenAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    camera?: NullableStringFieldUpdateOperationsInput | string | null
    lens?: NullableStringFieldUpdateOperationsInput | string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    selected?: BoolFieldUpdateOperationsInput | boolean
    rejected?: BoolFieldUpdateOperationsInput | boolean
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GalleryPhotoUncheckedUpdateWithoutGalleryInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    qualityScore?: NullableFloatFieldUpdateOperationsInput | number | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    isHighlight?: BoolFieldUpdateOperationsInput | boolean
    aiReasoning?: NullableStringFieldUpdateOperationsInput | string | null
    technicalQuality?: NullableJsonNullValueInput | InputJsonValue
    emotionalImpact?: NullableFloatFieldUpdateOperationsInput | number | null
    takenAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    camera?: NullableStringFieldUpdateOperationsInput | string | null
    lens?: NullableStringFieldUpdateOperationsInput | string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    selected?: BoolFieldUpdateOperationsInput | boolean
    rejected?: BoolFieldUpdateOperationsInput | boolean
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GalleryPhotoUncheckedUpdateManyWithoutGalleryInput = {
    id?: StringFieldUpdateOperationsInput | string
    filename?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    qualityScore?: NullableFloatFieldUpdateOperationsInput | number | null
    category?: NullableStringFieldUpdateOperationsInput | string | null
    isHighlight?: BoolFieldUpdateOperationsInput | boolean
    aiReasoning?: NullableStringFieldUpdateOperationsInput | string | null
    technicalQuality?: NullableJsonNullValueInput | InputJsonValue
    emotionalImpact?: NullableFloatFieldUpdateOperationsInput | number | null
    takenAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    camera?: NullableStringFieldUpdateOperationsInput | string | null
    lens?: NullableStringFieldUpdateOperationsInput | string | null
    settings?: NullableJsonNullValueInput | InputJsonValue
    selected?: BoolFieldUpdateOperationsInput | boolean
    rejected?: BoolFieldUpdateOperationsInput | boolean
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}