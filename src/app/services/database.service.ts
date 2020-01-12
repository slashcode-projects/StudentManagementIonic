import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { HttpClient } from '@angular/common/http';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Student {
  studId: number;
  name: string;
  class: string;
  mark: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private database: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  students = new BehaviorSubject([]);

  constructor(private plt: Platform, private sqlitePorter: SQLitePorter, private sqlite: SQLite, private http: HttpClient) {
    this.plt.ready().then(() => {
      this.sqlite.create({
        name: 'studentsDatabase.db',
        location: 'default'
      })
      .then((db: SQLiteObject) => {
          this.database = db;
          this.seedDatabase();
      });
    });
  }

  seedDatabase() {
    this.http.get('assets/studentScript.sql', { responseType: 'text'})
    .subscribe(sql => {
      this.sqlitePorter.importSqlToDb(this.database, sql)
        .then(_ => {
          this.loadStudents();
          this.dbReady.next(true);
        })
        .catch(e => console.error(e));
    });
  }

  getDatabaseState() {
    return this.dbReady.asObservable();
  }

  getStudents(): Observable<Student[]> {
    return this.students.asObservable();
  }
  loadStudents() {
    return this.database.executeSql('SELECT * FROM Students', []).then(data => {
      let students: Student[] = [];

      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          students.push({
            studId: data.rows.item(i).studId,
            name: data.rows.item(i).name,
            class: data.rows.item(i).class,
            mark: data.rows.item(i).mark
           });
        }
      }
      this.students.next(students);
    });
  }
  addStudentData(studName, studClass, studMark) {
    let data = [studName, studClass, studMark];
    return this.database.executeSql('INSERT INTO Students (name, class, mark) VALUES (?, ?, ?)', data).then(data => {
      this.loadStudents();
    });
  }
  getStudentById(id): Promise<Student> {
    return this.database.executeSql('SELECT * FROM Students WHERE studId = ?', [id]).then(data => {
      return {
        studId: data.rows.item(0).studId,
        name: data.rows.item(0).name,
        class: data.rows.item(0).class,
        mark: data.rows.item(0).mark
      };
    });
  }
  updateStudent(student: Student) {
    let data = [student.name, student.class, student.mark];
    return this.database.executeSql(`UPDATE Students SET name = ?, class = ?, mark = ? WHERE studId = ${student.studId}`, data).then(data => {
      this.loadStudents();
    });
  }
  deleteStudent(studId) {
    console.log('Inside Deleting DB Student Id '+ studId);
    return this.database.executeSql('DELETE FROM Students WHERE studId = ?', [studId]).then(_ => {
      this.loadStudents();
    });
  }
}
