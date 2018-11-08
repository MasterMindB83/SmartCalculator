import { Component } from '@angular/core';
import { parseSelectorToR3Selector } from '@angular/compiler/src/core';
import { THROW_IF_NOT_FOUND } from '@angular/core/src/di/injector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'SmartCalculator';
  constructor() {
    this.display = '0';
    this.inv = false;
    this.cifra = '0123456789.e';
    this.func = 'sincostaqrt';
    this.sign = '/*-+^';
    this.pos = 0;
    this.error = '';
  }
  display: string;
  inv: boolean;
  cifra: string;
  func: string;
  sign: string;
  error: string;
  pos: number;
  EvaluateSum() {
    this.error = '';
    this.display = this.Evaluate(this.display).toString();
  }
  Evaluate(expression: string): number {
    if (expression === '')
    {
      this.error = 'Error: Empty expression';
      return NaN;
    } else if (expression === 'NaN')
    {
      return NaN;
    }
    let expression2 = expression;
    while (expression2.substring(0, 1) === '(') {// uklanjanje duplih zagrada
      let pos1 = 1;
      let count = 1;
      while (count > 0 && pos1 < expression2.length) {
        if ( expression2.substring(pos1, pos1 + 1) === '(') {
          count++;
        }
        if ( expression2.substring(pos1, pos1 + 1) === ')') {
          count--;
        }
        if (count <= 0) {
          break;
        }
        pos1++;
      }
      if (pos1 >= expression2.length - 1 && count === 0) {
        expression2 = expression2.substring(1, expression2.length - 1);
      } else {
        break;
      }
    }
    if (this.IsNumber(expression2)) {// ako ceo izraz je broj
      return parseFloat(expression2);
    }
    let result: Item;
    let item: string[] = [];
    let itemNo: number;
    itemNo = 0;
    let pos: number;
    pos = 0;
    result = this.GetItem(expression2, pos); // ako je funkcija
    if (result.pos >= expression2.length) {
      let func: string;
      func = '';
      pos = 0;
      while (this.IsFunc(expression2, pos)) {
        func += expression2.substring(pos, pos + 1);
        pos++;
      }
      pos++;
      return this.Calculate(0, func, this.Evaluate(expression2.substring(pos, expression2.length - 1)));
    }
      pos = 0;
      while (pos < expression2.length) {
        result = this.GetItem(expression2, pos);
        item[itemNo] = result.item;
        pos = result.pos;
        itemNo++;
      }
      while (itemNo > 1) {
        let current = 0;
        if (itemNo === 1) {
          return this.Evaluate(item[0]);
        } else if ( itemNo === 3) {
          return this.Calculate(this.Evaluate(item[0]), item[1], this.Evaluate(item[2]));
        } else {
          while (!this.GetPriority(item[current + 1], item[current + 3]) && current < itemNo) {
            current += 2;
          }
          item[current] = this.Calculate(this.Evaluate(item[current]), item[current + 1], this.Evaluate(item[current + 2])).toString();
          for (let i = current + 1; i < itemNo; i++) {
            item[i] = item[i + 2];
          }
          itemNo -= 2;
        }
      }

    return 0;
  }
    Priority(sign: string) {
    if ( sign === '+' || sign === '-') {
      return 0;
    } else if ( sign === '*' || sign === '/') {
      return 1;
    } else if ( sign === '^') {
      return 2;
    } else {
      return -1;
    }
  }
  GetPriority(sign1: string, sign2: string) {
    if (sign2 === '^') {
      return false;
    } else if (this.Priority(sign2) > this.Priority(sign1) ) {
      return false;
    } else {
      return true;
    }
  }
  Draw() {
      const result: Item = this.GetItem(this.display, this.pos);
      this.pos = result.pos;
      this.error = result.item;
  }
  IsNumber(text: string) {
    let bCifra = true;
    for (let i = 0; i < text.length; i++) {
      if (!this.IsCifra(text, i)) {
        bCifra = false;
        break;
      }
    }
    return bCifra;
  }
  Contains(text: string, item: string) {
    if (text.indexOf(item) !== -1) {
      return true;
    } else {
      return false;
    }
  }
  GetItem(text: string, pos1: number) {
    let result: Item;
    let pos2: number = pos1;
    if (pos1 > text.length) {
      result = {item: '', pos: pos1};
      return result;
    }
    if (this.IsCifra(text, pos2)) {
      while (this.IsCifra(text, pos2)) {
        pos2++;
      }
    } else if (text.substring(pos2, pos2 + 1) === '(') {
        pos2 = pos1  + 1;
        let count = 1;
        while (count > 0 && pos2 < text.length) {
          if ( text.substring(pos2, pos2 + 1) === '(') {
            count++;
          }
          if ( text.substring(pos2, pos2 + 1) === ')') {
            count--;
          }
          if (count <= 0) {
            pos2++;
            break;
          }
          pos2++;
        }
        if (count === 0) {
          result = {item: text.substring(pos1, pos2), pos: pos2};
          return result;
        } else {
          result = {item: '', pos: text.length};
          return result;
        }
    } else if (this.IsFunc(text, pos1)) {
      pos2 = text.indexOf('(');
      let count: number;
      pos2++;
      count = 1;
      while (count > 0 && pos2 < text.length) {
        if ( text.substring(pos2, pos2 + 1) === '(') {
          count++;
        }
        if ( text.substring(pos2, pos2 + 1) === ')') {
          count--;
        }
        pos2++;
        if ( count === 0) {
          break;
        }
      }
    } else {
      result = {pos : pos1 + 1, item : text.substring(pos1, pos1 + 1)};
      return result;
    }
    if (pos2 > pos1) {
      result = {pos : pos2, item: text.substring(pos2, pos1)};
      return result;
    }
    return {pos: text.length, item: ''};
  }
  IsFunc(text: string, pos: number) {
    for (let i = 0; i < this.func.length; i++) {
      if (this.func.substring(i, i + 1) === text.substring(pos, pos + 1)) {
        return true;
      }
    }
    return false;
  }
  IsCifra(text: string, pos: number) {
    if (pos > text.length) {
      return false;
    }
    const pom: string = text.substring(pos, pos + 1);
    let pom3: string;
    if (pos > 0) {
      pom3 =  text.substring(pos - 1, pos);
    } else {
      pom3 = '';
    }
      if (pom === '-' && pos === 0) {
        return true;
      } else if (pom === '-' && pom3 === '(') {
        return true;
      } else if ((pom === '-' && pom3 === 'e') || (pom === '+' && pom3 === 'e')) {
        return true;
      }
    for ( let i = 0; i < this.cifra.length; i++) {
      const pom4: string = this.cifra.substring(i, i + 1);
      if (pom4 === pom ) {
        return true;
      } else {
      }
    }
    return false;
  }
  SetDisplay(text) {
    if (this.display === '0') {
      this.display = text;
    } else {
      this.display = this.display + text;
    }
  }
  SetDisplay2(text) {
      this.display = this.display + text;
  }
  SetDisplay3(text) {
    if (this.display === '0') {
      if ( this.inv) {
        this.display = 'a' + text + '(';
      } else {
        this.display = text + '(';
      }
    } else {
      if ( this.inv) {
        this.display =  this.display + 'a' + text + '(';
      } else {
        this.display = this.display + text + '(';
      }
    }
}
Inv() {
  if (this.inv) {
    this.inv = false;
  } else {
    this.inv = true;
  }
}
  CE() {
    this.display = '0';
  }
  C() {
      this.display = this.display.substring(0, this.display.length - 1);
      if (this.display === '') {
        this.display = '0';
      }
    }
    Calculate(operand1: number, operacija: string, operand2: number): number {
      if (operacija !== '') {
        if (operacija === '+') {
          return operand1 + operand2;
        } else if (operacija === '-') {
          return operand1 - operand2;
        } else if (operacija === '*') {
          return operand1 * operand2;
        } else if (operacija === '/') {
          return operand1 / operand2;
        } else if (operacija === '^') {
          return Math.pow(operand1, operand2);
        } else if (operacija === 'sin') {
          return Math.sin(operand2);
        } else if (operacija === 'asin') {
          return Math.asin(operand2);
        } else if (operacija === 'cos') {
          return Math.cos(operand2);
        } else if (operacija === 'acos') {
          return Math.acos(operand2);
        } else if (operacija === 'tan') {
          return Math.atan(operand2);
        } else if (operacija === 'atan') {
          return Math.atan(operand2);
        } else if (operacija === 'sqrt') {
          return Math.sqrt(operand2);
        }
      }
      return NaN;
    }
}
class Item {
  pos: number;
  item: string;
}
