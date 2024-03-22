import { ClassSerializerInterceptor, UseInterceptors } from "@nestjs/common";

export function Serialize() {
    return UseInterceptors(ClassSerializerInterceptor);
  }