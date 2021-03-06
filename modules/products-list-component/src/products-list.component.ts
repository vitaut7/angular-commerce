import { Params } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Inject, Input} from '@angular/core';
import {Router} from '@angular/router';
import {DbAbstractionLayer} from "@nodeart/dal";
import {Subject} from 'rxjs/Subject';
import {ProductService} from "@nodeart/productservice";
/**
 * Display products form specific category. There are two methods of passing category id: 
 * 1. Input id to categoryId variable
 * 2. Pass add route parametr, like "category/3"
 */
@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {

  /**
   * Products array
   */
  products: any = [];
  
  /**
   * RxJs Subject of current page
   */
  currentPageStream = new Subject<number>();

  /**
   * Current page number
   */
  currentPage = 1;

  /**
   * Total pages for products
   */
  totalPages = 0;

  /**
   * Number of products on page 
   */
  itemsOnPage = 10;

  /**
   * Attributes for category
   */
  attrs = [];

  /**
   * Tags for category
   */
  tags = [];

  /**
   * Category id
   */
  @Input() categoryId = "";

  constructor(private dal: DbAbstractionLayer,
              private router: Router, 
              private productService: ProductService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.getProducts();
    this.route.params.forEach((params: Params) => {
      if(params['id']){
        this.categoryId = params['id'];
      }
      
      });
    this.getTotalPages();
    this.currentPageStream.subscribe(newPage => {
      this.getProducts();
    });
  }

  /**
   * Increment page
   */
  inc(){
    this.currentPageStream.next(++this.currentPage);
  }

  /**
   * Decrement page
   */
  dec(){
    this.currentPageStream.next(--this.currentPage);
  }

  /**
   * On select product navigeate to product page
   * @param id product id
   */
  onSelect(id){
    this.router.navigate(['product', id]);
  }

  /**
   * Get products by category id
   */
  getProducts(){
    console.log(this.attrs);
    console.log(this.tags);
    this.productService
      .searchProducts(this.attrs, this.tags, this.itemsOnPage, (this.currentPage - 1) * this.itemsOnPage)
      .subscribe( data =>{
      if(data.val()){
        this.products = data.val().map(item => {
          item['_source']['id'] = item['_id'];
          return item['_source'];
        });
        console.log(this.products);
      }
    });
  }

  /**
   * Filter products by attrutes and tags
   */
  filter(){
    this.currentPage = 1;
    this.getTotalPages();
    this.productService.filterProducts(this.attrs, this.tags, this.itemsOnPage, (this.currentPage - 1) * this.itemsOnPage)
      .subscribe(data => {
        if (data.val()){
          if (data.val()['total'] == 0) { 
            this.products = [];
          }else if (data.val()['hits']){
            this.products = data.val()['hits'].map(item => {
              item['_source']['id'] = item['_id'];
              return item['_source'];
            });
          }
          console.log(this.products);
        }
    });
  }

  /**
   * Get total pages for product from category
   */
  getTotalPages(){
    this.productService.getTotalPages(this.attrs, this.tags).subscribe( data => {
      if(data.val()){
        let items = data.val();
        this.totalPages = Math.ceil(items / this.itemsOnPage);
      }
    });
  }

  /**
   * Set new selected attributes
   * @param newAttrs 
   */
  updateAttrs(newAttrs){
    this.attrs = newAttrs;
  }

  /**
   * Set new selected tags
   * @param newTags 
   */
  updateTags(newTags){
    this.tags = newTags;
  }
}
