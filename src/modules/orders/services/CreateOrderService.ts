import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const foundCustomer = await this.customersRepository.findById(customer_id);
    if (!foundCustomer) {
      throw new AppError('Customer not found');
    }

    const foundProducts = await this.productsRepository.findAllById(products);

    if (!foundProducts.length) {
      throw new AppError('Products not found');
    }

    const productsId = foundProducts.map(product => product.id);

    const inexistentProducts = products.filter(
      product => !productsId.includes(product.id),
    );

    if (inexistentProducts.length) {
      throw new AppError(
        `the fallowings ids were not found: ${inexistentProducts
          .map(product => product.id)
          .join()}`,
      );
    }

    const productsWithNoAvailableQuantity = products.filter(product => {
      const filteredProducts = foundProducts.filter(
        foundProduct =>
          product.id === foundProduct.id &&
          product.quantity > foundProduct.quantity,
      );
      return !!filteredProducts.length;
    });

    if (productsWithNoAvailableQuantity.length) {
      throw new AppError(
        `No quantity available for the products ${productsWithNoAvailableQuantity
          .map(product => product.id)
          .join()}`,
      );
    }

    const mappedProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price:
        foundProducts.find(savedProduct => savedProduct.id === product.id)
          ?.price ?? 0,
    }));

    const order = await this.ordersRepository.create({
      customer: foundCustomer,
      products: mappedProducts,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
