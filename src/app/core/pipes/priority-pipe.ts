import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priority',
})
export class PriorityPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    // 'low' | 'medium' | 'high'
    switch (value) {
      case 'low':
        return '低';
      case 'medium':
        return '中';
      case 'high':
        return '高';
      default:
        return '';
    }
  }
}
