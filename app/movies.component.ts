import { Component, OnInit } from '@angular/core';
import {MoviesService} from "./movies.service";
import {type} from "os";

@Component({
    selector: 'movies',
    template: `
        <title>Movies</title>
        <form>
            <input type="radio" name="category" id="opening" (click)="getTomatoMovies('opening')" checked> Opening
            <input type="radio" name="category" id="boxoffice" (click)="getTomatoMovies('boxoffice')"> Canada Box Office
            <input type="radio" name="category" id="upcoming" (click)="getTomatoMovies('upcoming')"> Upcoming!
        </form>
        <h3>{{selectedMovie?.title}}</h3>
        <div>
        <img id="poster" src="{{posterUrl}}" style="width:200px; height:297px;"><span style="float: right">{{selectedMovie?.synopsis}}</span>
        </div>
        <table *ngIf="!error">
        <thead>
        <tr>
        <th>Rotten</th><th>Imdb</th><th>Movie</th><th>Status</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let m of moviesResultObj" class="clickable" [class.selected]="m.id === selectedMovieId" (click)="selectMovie(m)">
        <td>{{m?.ratings.critics_score}}</td><td>{{m?.ratings.audience_score}}</td><td>{{m?.title}}</td>
        </tr>
        </tbody>
        </table>
    `,
    providers: [MoviesService]
})

export class MoviesComponent {

    moviesResult: string;
    moviesResultObj: {};
    category: string;
    selectedMovieId: number;
    selectedMovie: {};
    selectedMoviePosterJson: string;
    posterJson: {};
    posterUrl: string;
    thePoster: any;

    constructor(private _mvsService: MoviesService){}

    ngOnInit() {

        let storedCategory = sessionStorage['selectedCategory'];
        if (storedCategory) {
            this.category = storedCategory;
            this.getTomatoMovies(storedCategory);
            document.getElementById(storedCategory)['checked'] = true;
        } else
        {
            this.category = 'opening';
            this.getTomatoMovies('opening');
        }

    }

    getTomatoMovies(queryType: string) {
        sessionStorage['selectedCategory'] = queryType;
        this.category = queryType;
        this._mvsService.getMovies(queryType).subscribe(
            data => {
                this.moviesResult = JSON.stringify(data);
                this.moviesResultObj = JSON.parse(this.moviesResult).movies;

                let storedMovieId = sessionStorage['selectedMovieId'+queryType];
                if (storedMovieId) {
                    this.selectedMovieId = storedMovieId;
                    let i = 0;
                    for (i ; this.moviesResultObj[i] ; i++) {
                        if ( this.moviesResultObj[i]['id'] === storedMovieId ) {
                            this.selectedMovie = this.moviesResultObj[i];
                            break;
                        }
                    }
                } else {

                    this.selectedMovie = JSON.parse(this.moviesResult).movies[0];
                    this.selectedMovieId = this.selectedMovie['id'];
                    sessionStorage['selectedMovieId'+queryType] = this.selectedMovieId;
                }
                this.getSelectedMoviePoster(this.selectedMovie);
           },
            error => alert(error),
            () => console.log("Finished")
        );
    }

    selectMovie(m: any) {
        sessionStorage['selectedMovieId'+this.category] = m.id;
        this.selectedMovieId = m.id;
        this.selectedMovie = m;
        this.getSelectedMoviePoster(m);
    }

    getSelectedMoviePoster (movie: any) {
        let id: string;
        let isTitle = 'false';
        if (movie['alternate_ids'] == undefined) {
            isTitle = 'true';
            id = this.selectedMovie['title'];
        } else {
            isTitle = 'false';
            id = this.selectedMovie['alternate_ids']['imdb'];
        }
        this.posterUrl = "http://www.tordnet.com/angular/php/posters.php?movieId="+id+"&isMovieTitle="+isTitle;
    }
}