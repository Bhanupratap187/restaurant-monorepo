import mongoose from 'mongoose';
import {
  User,
  Order,
  MenuItem,
  OrderItem,
} from '@restaurant-monorepo/shared-types';

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  mongoUri: string;
  options?: mongoose.ConnectOptions;
}

/**
 * Connect to the MongoDB database
 */
export async function connectDatabase(config: DatabaseConfig): Promise<void> {
  const mongoUri =
    config.mongoUri ||
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/restaurant';

  const options: mongoose.ConnectOptions = {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    w: 'majority',
    ...config.options,
  };
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, options);
    console.log('✅ Connected to MongoDB');

    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error', error);
      throw error;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('❌ MongoDB disconnected');
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB', error);
    throw error;
  }
}

/**
 * Disconnect from the MongoDB database
 */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB');
}

// User Schema and Model
const userSchema = new mongoose.Schema<User & mongoose.Document>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxLength: [50, 'Name must be less than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minLength: [6, 'Password must be at least 6 characters long'],
      maxLength: [128, 'Password must be less than 128 characters'], // Add this line
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['owner', 'manager', 'chef', 'waiter'],
        message: 'Role must be either owner, manager, chef, or waiter',
      },
      required: [true, 'Role is required'],
      default: 'waiter',
    },
    permissions: [
      {
        type: String,
        enum: [
          'VIEW_ORDERS',
          'UPDATE_ORDER_STATUS',
          'MANAGE_MENU',
          'VIEW_REPORTS',
          'MANAGE_STAFF',
          'PROCESS_PAYMENTS',
          'VIEW_CUSTOMER_DATA',
        ],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: Partial<User> & { __v?: number }) {
        delete ret.password;
        delete ret?.__v;
        return ret;
      },
    },
  }
);

// Indexing for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ lastLogin: 1 });

export const UserModel = mongoose.model<User & mongoose.Document>(
  'User',
  userSchema
);

// Menu Item Schema and Model

const menuItemSchema = new mongoose.Schema<MenuItem & mongoose.Document>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxLength: [100, 'Name must be less than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxLength: [500, 'Description must be less than 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be greater than 0'],
    },
    category: {
      type: String,
      enum: {
        values: ['appetizer', 'main_course', 'dessert', 'beverage', 'special'],
        message:
          'Category must be either appetizer, main_course, dessert, beverage, or special',
      },
      required: [true, 'Category is required'],
    },
    available: {
      type: Boolean,
      default: true,
    },
    prepTime: {
      type: Number,
      required: [true, 'Preparation time is required'],
      min: [0, 'Preparation time must be greater than 0'],
    },
    allergens: {
      type: [String],
      trim: true,
    },
    imageUrl: {
      type: String,
      validate: {
        validator: function (value: string) {
          return !value || /^https?:\/\/.+/.test(value);
        },
        message: 'Image URL must be a valid URL',
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: Partial<MenuItem> & { __v?: number }) {
        delete ret?.__v;
        return ret;
      },
    },
  }
);

// Indexing for performance
menuItemSchema.index({ name: 1 }, { unique: true });
menuItemSchema.index({ category: 1 });
menuItemSchema.index({ available: 1 });
menuItemSchema.index({ prepTime: 1 });
menuItemSchema.index({ allergens: 1 });

export const MenuItemModel = mongoose.model<MenuItem & mongoose.Document>(
  'MenuItem',
  menuItemSchema
);

// Order Schemas
const orderItemSchema = new mongoose.Schema<OrderItem & mongoose.Document>({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: [true, 'Menu item ID is required'],
  },
  menuItemName: {
    type: String,
    required: [true, 'Menu item name is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative'],
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative'],
  },
  specialInstructions: {
    type: String,
    maxLength: [200, 'Special instructions cannot exceed 200 characters'],
  },
});

const orderSchema = new mongoose.Schema<Order & mongoose.Document>(
  {
    orderNumber: { type: String, unique: true, required: true },
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
      min: [1, 'Table number must be positive'],
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (items: OrderItem[]) {
          return items && items.length > 0;
        },
        message: 'Order must have at least one item',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'preparing', 'ready', 'served', 'cancelled'],
        message:
          'Status must be one of: pending, preparing, ready, served, cancelled',
      },
      default: 'pending',
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },
    customerName: {
      type: String,
      trim: true,
      maxLength: [100, 'Customer name cannot exceed 100 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: Partial<Order> & { __v?: number }) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const date = new Date();
    const dateStr =
      date.getFullYear().toString() +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      date.getDate().toString().padStart(2, '0');

    const count = await mongoose.model('Order').countDocuments({
      createdAt: { $gte: new Date(date.setHours(0, 0, 0, 0)) },
    });

    this.orderNumber = `ORD-${dateStr}-${(count + 1)
      .toString()
      .padStart(3, '0')}`;
  }
  next();
});

// Indexing for performance
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ createdAt: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdBy: 1 });

export const OrderModel = mongoose.model<Order & mongoose.Document>(
  'Order',
  orderSchema
);

// Export mongoose instance
export { mongoose };

export function database(): string {
  return 'database';
}
