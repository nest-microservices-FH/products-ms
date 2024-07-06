import { HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductsSetvice')

  onModuleInit() {
    this.$connect()
    this.logger.log(`Data base connected`)
    // throw new Error('Method not implemented.');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto
    });

    // return createProductDto;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto

    const totalPage = await this.product.count({where:{available:true}})

    const lastPage = Math.ceil(totalPage / limit)

    return {

      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where:{available:true}
      }),
      meta: {
        total: totalPage,
        page: page,
        lastPage: lastPage
      }
    }


  }

  async findOne(id: number) {
    const product = await this.product.findFirst({ where: { id: id,available:true } })
    // if (!product) throw new NotFoundException(`Producto with id ${id} not found`)
    if (!product) throw new RpcException({message:`Producto with id ${id} not found`,status:HttpStatus.BAD_REQUEST})
    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const {id:__,...data}=updateProductDto
    await this.findOne(id)

    return await this.product.update({ where: { id: id }, data: data })

  }

  async remove(id: number) {
    await this.findOne(id)
    const product= await this.product.update({
      where:{id},
      data:{
        available:false
      }
    })
    return product
  }
}
