import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    const savedProduct = await this.ormRepository.save(product);

    return savedProduct;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    return this.ormRepository.findOne({ where: { name } });
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productIds = products.map(product => product.id);
    return this.ormRepository.findByIds(productIds);
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productIds = products.map(product => product.id);
    const savedProducts = await this.ormRepository.findByIds(productIds);

    const updatedProductQuantity = savedProducts.map(product => {
      const productIndex = products.findIndex(
        receivedProducts => receivedProducts.id === product.id,
      );
      const newQuantity = product.quantity - products[productIndex].quantity;
      return { ...product, quantity: newQuantity };
    });
    return this.ormRepository.save(updatedProductQuantity);
  }
}

export default ProductsRepository;
