import { ILogger, resolve } from "aurelia";
import DatabaseStores from "../common/database-stores";

export class DatabaseService {
	private dbName = "TodoApp";
	private dbVersion = 1;
	private db: IDBDatabase | null = null;

	private readonly logger: ILogger = resolve(ILogger).scopeTo('DatabaseService');

	constructor() {
		this.openDatabase().then(() => {
			this.logger.info("Database ready");
		}).catch((error) => {
			this.logger.error("Error opening database:", error);
		});
	}

	private isDatabaseOpen(): boolean {
		return this.db !== null;
	}

	private async ensureDatabaseOpen(): Promise<void> {
		console.log(this.isDatabaseOpen());
		if (!this.isDatabaseOpen()) {
			await this.openDatabase();
		}
	}

	openDatabase(): Promise<void> {
		console.info("Opening database");
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName);

			request.onerror = (event) => {
				this.logger.error("Database error:", (event.target as IDBOpenDBRequest).error);
				reject((event.target as IDBOpenDBRequest).error);
			};

			request.onsuccess = (event) => {
				this.db = (event.target as IDBOpenDBRequest).result;
				console.info(this.db);
				this.logger.info("Database opened successfully");

				// Check and create stores if they don't exist
				this.ensureStoresExist(this.db)
					.then(() => {
						this.logger.info("All stores are ready");
						resolve();
					})
					.catch((error) => {
						this.logger.error("Error ensuring stores exist:", error);
						reject(error);
					});
			};

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				this.createStores(db);
			};
		});
	}

	private ensureStoresExist(db: IDBDatabase): Promise<void> {
		console.info("Ensuring stores exist");
		return new Promise((resolve, reject) => {
			const storeNames = Object.values(DatabaseStores).filter(value => typeof value === 'string');
			const missingStores = storeNames.filter(
				storeName => !db.objectStoreNames.contains(storeName as string)
			);

			if (missingStores.length === 0) {
				this.logger.info("All stores already exist");
				resolve();
				return;
			}

			// Close the current database connection
			db.close();

			// Reopen the database with a new version to trigger onupgradeneeded
			const newVersion = db.version + 1;
			const reopenRequest = indexedDB.open(this.dbName, newVersion);

			reopenRequest.onerror = (event) => {
				this.logger.error("Error reopening database:", (event.target as IDBOpenDBRequest).error);
				reject((event.target as IDBOpenDBRequest).error);
			};

			reopenRequest.onsuccess = (event) => {
				this.db = (event.target as IDBOpenDBRequest).result;
				this.logger.info("Database reopened successfully");
				resolve();
			};

			reopenRequest.onupgradeneeded = (event) => {
				const upgradedDb = (event.target as IDBOpenDBRequest).result;
				this.createStores(upgradedDb);
			};
		});
	}

	public getNextKey(storeName: string): Promise<number> {
		return new Promise((resolve, reject) => {
			if (this.db) {
				const transaction = this.db.transaction([storeName], "readonly");
				const objectStore = transaction.objectStore(storeName);
				const request = objectStore.openCursor(null, 'prev');

				request.onsuccess = (event) => {
					const cursor = (event.target as IDBRequest).result;
					if (cursor) {
						// The cursor is positioned at the last record due to 'prev' direction
						const maxKey = cursor.key as number;
						console.log("the max key is", maxKey);
						// Resolve immediately with the highest key + 1
						resolve(maxKey + 1);
					} else {
						// The store is empty
						console.log("Store is empty, returning 1");
						resolve(1);
					}
				};

				request.onerror = (event) => {
					const error = (event.target as IDBRequest).error;
					this.logger.error("Error getting next key:", error);
					reject(error);
				};
			} else {
				reject(new Error("Database not opened"));
			}
		});
	}

	private createStores(db: IDBDatabase): void {
		const storeNames = Object.values(DatabaseStores).filter(value => typeof value === 'string');
		for (const storeName of storeNames) {
			if (!db.objectStoreNames.contains(storeName)) {
				this.logger.info("Creating object store:", storeName);

				// if (storeName === DatabaseStores.NOTES || storeName === DatabaseStores.NOTE_COLLECTIONS) {
				//     db.createObjectStore(storeName, { autoIncrement: false });
				// } else if (storeName === DatabaseStores.DELETED_ITEMS) {
				//     db.createObjectStore(storeName, { autoIncrement: false });
				// }
				// else {
				db.createObjectStore(storeName, { autoIncrement: false });
				// }
				this.logger.info("Object store", storeName, "created");
			}
		}
	}

	public async addItem(storeName: string, item: any): Promise<number> {
		if (!this.db) {
			throw new Error("Database not opened");
		}

		try {
			const nextKey = await this.getNextKey(storeName);
			item.key = nextKey;  // Always assign the next key
			console.info(`Next key for ${storeName}:`, nextKey);

			return new Promise((resolve, reject) => {
				const transaction = this.db!.transaction([storeName], "readwrite");
				const objectStore = transaction.objectStore(storeName);

				console.log(`Attempting to add item to ${storeName}:`, item);

				const request = objectStore.add(item, nextKey);  // Provide the key explicitly

				request.onsuccess = (event) => {
					const key = (event.target as IDBRequest).result as number;
					console.log(`Successfully added item to ${storeName} with key:`, key);
					resolve(key);
				};

				request.onerror = (event) => {
					const error = (event.target as IDBRequest).error;
					console.error(`Error adding item to ${storeName}:`, error);
					reject(error);
				};
			});
		} catch (error) {
			console.error(`Error in addItem for ${storeName}:`, error);
			throw error;
		}
	}

	public async updateItem(storeName: string, key: number, updatedData: any): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.db) {
				const transaction = this.db.transaction([storeName], "readwrite");
				const objectStore = transaction.objectStore(storeName);

				console.log(`Attempting to update item in ${storeName} with key:`, key);

				// Ensure the key is part of the updatedData
				// updatedData.key = key;

				const request = objectStore.put(updatedData, key);

				request.onsuccess = () => {
					console.log(`Successfully updated item in ${storeName} with key:`, key);
					resolve();
				};

				request.onerror = (event) => {
					const error = (event.target as IDBRequest).error;
					console.error(`Error updating item in ${storeName}:`, error);
					reject(error);
				};
			} else {
				reject(new Error("Database not opened"));
			}
		});
	}

	public async getAllItems(storeName: string): Promise<any[]> {
		await this.ensureDatabaseOpen();
		return new Promise((resolve, reject) => {
			if (this.db) {
				const transaction = this.db.transaction([storeName], "readonly");
				const objectStore = transaction.objectStore(storeName);
				const request = objectStore.openCursor();
				const items: any[] = [];

				request.onsuccess = (event) => {
					const cursor = (event.target as IDBRequest).result;
					if (cursor) {
						// Include the key in the object
						const item = { ...cursor.value, key: cursor.key };
						items.push(item);
						cursor.continue();
					} else {
						console.log(`Retrieved ${items.length} items from ${storeName}`);
						resolve(items);
					}
				};

				request.onerror = (event) => {
					const error = (event.target as IDBRequest).error;
					console.error(`Error retrieving items from ${storeName}:`, error);
					reject(error);
				};
			} else {
				reject(new Error("Database not opened"));
			}
		});
	}

	public async getItem(storeName: string, key: IDBValidKey): Promise<any> {
		await this.ensureDatabaseOpen();
		return new Promise((resolve, reject) => {
			if (this.db) {
				const transaction = this.db.transaction([storeName], "readonly");
				const objectStore = transaction.objectStore(storeName);
				const request = objectStore.get(key);

				request.onsuccess = (event) => {
					const item = (event.target as IDBRequest).result;
					if (item) {
						// Include the key in the object
						resolve({ ...item, key: key });
					} else {
						resolve(null);
					}
				};

				request.onerror = (event) => {
					const error = (event.target as IDBRequest).error;
					console.error(`Error getting item from ${storeName}:`, error);
					reject(error);
				};
			} else {
				reject(new Error("Database not opened"));
			}
		});
	}

	public async deleteItem(storeName: string, key: IDBValidKey): Promise<void> {
		await this.ensureDatabaseOpen();
		return new Promise((resolve, reject) => {
			if (this.db) {
				const transaction = this.db.transaction([storeName], "readwrite");
				const objectStore = transaction.objectStore(storeName);

				// Ensure the key is not undefined
				if (key === undefined) {
					reject(new Error("Key is undefined"));
					return;
				}

				const request = objectStore.delete(key);

				request.onsuccess = () => {
					this.logger.info("Item deleted successfully");
					resolve();
				};

				request.onerror = (event) => {
					this.logger.error("Error deleting item:", (event.target as IDBRequest).error);
					reject((event.target as IDBRequest).error);
				};
			} else {
				reject(new Error("Database not opened"));
			}
		});
	}

	public async clearDatabaseStore(storeName: string): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.db) {
				const transaction = this.db.transaction([storeName], "readwrite");
				const objectStore = transaction.objectStore(storeName);

				const request = objectStore.clear();

				request.onsuccess = () => {
					this.logger.info("All elements have been deleted successfully");
					resolve();
				};

				request.onerror = (event) => {
					const error = (event.target as IDBRequest).error;
					this.logger.error("Error deleting all elements in store:", error);
					reject(error);
				};
			} else {
				reject(new Error("Database not opened"));
			}
		});
	}

	public async deleteStores(): Promise<void> {
		if (!this.db) {
			throw new Error("Database not opened");
		}

		const dbName = this.db.name;
		const storeNames = Object.values(DatabaseStores).filter(value => typeof value === 'string');

		// Close the current database connection
		this.db.close();
		this.db = null;

		return new Promise((resolve, reject) => {
			const request = indexedDB.open(dbName, Date.now()); // Use current timestamp as new version

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;

				// Delete all existing object stores
				for (const storeName of storeNames) {
					if (db.objectStoreNames.contains(storeName)) {
						db.deleteObjectStore(storeName);
					}
				}
			};

			request.onsuccess = (event) => {
				this.db = (event.target as IDBOpenDBRequest).result;
				this.logger.info("All stores deleted successfully");
				resolve();
			};

			request.onerror = (event) => {
				const error = (event.target as IDBOpenDBRequest).error;
				this.logger.error("Error deleting stores:", error);
				reject(error);
			};
		});
	}

}