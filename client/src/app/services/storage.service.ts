import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  set(key,value){
    localStorage.setItem(key,JSON.stringify(value));
  }
  get(key){
    if(!localStorage.getItem(key) || localStorage.getItem(key)=="undefined"){
      return null;
    }
    return JSON.parse(localStorage.getItem(key));
  }
  remove(key){
    localStorage.removeItem(key);
  }
}
