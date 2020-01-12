import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatabaseService, Student } from 'src/app/services/database.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-student',
  templateUrl: './student.page.html',
  styleUrls: ['./student.page.scss'],
})
export class StudentPage implements OnInit {
  student: Student = null;
  constructor(private router: Router, private route: ActivatedRoute, private db: DatabaseService, private toast: ToastController) { }
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      let studId = params.get('id');

      this.db.getStudentById(studId).then(data => {
        this.student = data;
      });
    });
  }

  updateStudentData() {
    this.db.updateStudent(this.student).then(async (res) => {
      let toast = await this.toast.create({
        message: 'Student Details Updated Successfully..',
        duration: 3000
      });
      toast.present();
    }).then(() => this.router.navigateByUrl('students'));
  }
  delete() {
    console.log('Deleting Student Id '+this.student.studId);
    this.db.deleteStudent(this.student.studId).then(() => {
      this.router.navigateByUrl('students');
    });
  }
}
