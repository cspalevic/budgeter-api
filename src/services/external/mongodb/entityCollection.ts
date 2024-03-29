import {
   Collection,
   CollectionAggregationOptions,
   FilterQuery,
   FindOneOptions,
   ObjectId,
   OptionalId,
   WithId
} from "mongodb";
import { IEntity } from "models/schemas/ientity";

/**
 * Collection that performs basic CRUD functionality for a MongoDB collection
 */
export class BudgeterEntityCollection<T extends IEntity> {
   protected collection: Collection<T>;

   constructor(collection: Collection<T>) {
      this.collection = collection;
   }

   public async aggregate(
      pipeline?: Record<string, unknown>[],
      options?: CollectionAggregationOptions
   ): Promise<T[]> {
      return await this.collection.aggregate(pipeline, options).toArray();
   }

   public async create(entity: Partial<T>): Promise<WithId<T>> {
      const date = new Date();
      const entityToCreate: Partial<T> = {
         ...entity,
         createdOn: date,
         modifiedOn: date
      };
      const response = await this.collection.insertOne(
         entityToCreate as OptionalId<T>
      );
      return response.ops[0];
   }

   public async getById(id: string): Promise<WithId<T>> {
      const entity = await this.collection.findOne({
         _id: new ObjectId(id)
      } as FilterQuery<T>);
      return entity as WithId<T>;
   }

   public async find(
      filter: FilterQuery<T>,
      options?: FindOneOptions<WithId<T> extends T ? T : WithId<T>>
   ): Promise<WithId<T>> {
      return await this.collection.findOne(filter, options);
   }

   public async findMany(
      query: FilterQuery<T>,
      options?: FindOneOptions<WithId<T> extends T ? T : WithId<T>>
   ): Promise<WithId<T>[]> {
      return await this.collection.find<WithId<T>>(query, options).toArray();
   }

   public async update(entity: T): Promise<WithId<T>> {
      const entityToUpdate: T = {
         ...entity,
         modifiedOn: new Date()
      };
      const response = await this.collection.replaceOne(
         { _id: entity._id } as FilterQuery<T>,
         entityToUpdate
      );
      return response.ops[0];
   }

   public async replace(
      filter: FilterQuery<T>,
      entity: Partial<T>
   ): Promise<void> {
      const entityToUpdate: Partial<T> = {
         ...entity,
         modifiedOn: new Date()
      };
      await this.collection.replaceOne(filter, entityToUpdate as T);
   }

   public async delete(id: ObjectId): Promise<void> {
      await this.collection.deleteOne({ _id: id } as FilterQuery<T>);
   }

   public async deleteAll(filter: FilterQuery<T>): Promise<void> {
      await this.collection.deleteMany(filter);
   }

   public async count(query?: FilterQuery<T>): Promise<number> {
      return await this.collection.countDocuments(query);
   }
}
