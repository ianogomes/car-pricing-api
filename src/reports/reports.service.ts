import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { CreateReportDto } from './dtos/create-report.dto';
import { User } from 'src/users/user.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';
@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  createEstimate({ make, model, lng, lat, year, mileage }: GetEstimateDto) {
    return this.repo
      .createQueryBuilder()
      .select('AVG(price)', 'price') // takes the average of the price of the selected query
      .where('make = :make', { make }) // filtering based on brand
      .andWhere('model = :model', { model }) //filtering based on model
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng }) //this gets the difference of the request lng with the stored lngs, and then checks if it is bellow 5 (or -5)
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat }) //the same above applied to lat
      .andWhere('year - :year BETWEEN -3 AND 3', { year }) //the same applied for year except it is a max difference of 3 years
      .andWhere('approved IS TRUE') // only if the data is approved
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameters({ mileage }) // order the data according to proximity of mileage
      .limit(3) //limits the filtered data to 3
      .getRawOne(); //IMPORTANT - As the final return is only one piece of data, the average, then we use One, not Many
  }

  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);
    report.user = user; //setting up association

    return this.repo.save(report);
  }

  async changeApproval(id: string, approved: boolean) {
    const report = await this.repo.findOne({ where: { id: parseInt(id) } });
    if (!report) {
      throw new NotFoundException('report not found');
    }

    report.approved = approved;
    return this.repo.save(report);
  }
}
