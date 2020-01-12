import { DatabaseService, Student } from './../../services/database.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-students',
  templateUrl: './students.page.html',
  styleUrls: ['./students.page.scss'],
})
export class StudentsPage implements OnInit {

  constructor(private db: DatabaseService) { }

  studentData = {};
  students: Student[] = [];
  ngOnInit() {
    this.db.getDatabaseState().subscribe(rdy => {
      if (rdy) {
        this.db.getStudents().subscribe(studs => {
          this.students = studs;
          console.log(this.students);
        });
      }
    });
  }
  addStudentDetails() {
    this.db.addStudentData(this.studentData['name'], this.studentData['class'], this.studentData['mark']).then(_ => {
      this.studentData = {};
    });
  }

}
