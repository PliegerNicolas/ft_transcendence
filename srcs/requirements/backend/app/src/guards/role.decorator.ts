import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const Role = Reflector.createDecorator<String[]>();

export const GlobalRole = Reflector.createDecorator<String[]>();