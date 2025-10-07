import { PartialType } from '@nestjs/mapped-types';
import { CreateCarouselImageDto } from './create-carousel-image.dto';

export class UpdateCarouselImageDto extends PartialType(CreateCarouselImageDto) {}
