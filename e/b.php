<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ใบสมัครงาน - บริษัท ธนากร จำกัด</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
</head>
<body>

    <div class="container my-5">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="card shadow-lg border-0 rounded-3">
                    <div class="card-header bg-primary text-white text-center py-3">
                        <h1 class="h3 mb-0">ใบสมัครงาน</h1>
                        <p class="mb-0">บริษัท ธนากร จำกัด</p>
                    </div>
                    <div class="card-body p-4 p-md-5">
                        <form method="POST">

                            <h2 class="h5 mb-4 border-bottom pb-2 text-primary">ตำแหน่งที่ต้องการสมัคร</h2>
                            <div class="mb-3">
                                <label for="jobPosition" class="form-label">ตำแหน่งที่ต้องการสมัคร <span class="text-danger">*</span></label>
                                <select class="form-select" id="jobPosition" name="jobPosition" required>
                                    <option value="" selected disabled>--- กรุณาเลือกตำแหน่ง ---</option>
                                    <option value="Software Engineer">วิศวกรซอฟต์แวร์ (Software Engineer)</option>
                                    <option value="Data Analyst">นักวิเคราะห์ข้อมูล (Data Analyst)</option>
                                    <option value="UX/UI Designer">นักออกแบบ UX/UI</option>
                                    <option value="Marketing Specialist">ผู้เชี่ยวชาญด้านการตลาดดิจิทัล</option>
                                    <option value="HR Coordinator">ผู้ประสานงานทรัพยากรบุคคล</option>
                                    <option value="Other">อื่นๆ (โปรดระบุ)</option>
                                </select>
                            </div>
                            <div class="mb-4" id="otherPositionField" style="display:none;">
                                <input type="text" class="form-control" id="otherPosition" name="otherPosition" placeholder="โปรดระบุตำแหน่งอื่นๆ">
                            </div>

                            <h2 class="h5 mb-4 mt-5 border-bottom pb-2 text-primary">ข้อมูลส่วนตัว</h2>
                            
                            <div class="row g-3 mb-3">
                                <div class="col-md-3">
                                    <label for="prefix" class="form-label">คำนำหน้า <span class="text-danger">*</span></label>
                                    <select class="form-select" id="prefix" name="prefix" required>
                                        <option value="" selected disabled>เลือก</option>
                                        <option value="นาย">นาย</option>
                                        <option value="นาง">นาง</option>
                                        <option value="นางสาว">นางสาว</option>
                                        <option value="อื่นๆ">อื่นๆ</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label for="firstName" class="form-label">ชื่อ (ภาษาไทย) <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="firstName" name="firstName" required>
                                </div>
                                <div class="col-md-5">
                                    <label for="lastName" class="form-label">นามสกุล (ภาษาไทย) <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="lastName" name="lastName" required>
                                </div>
                            </div>
                            
                            <div class="row g-3 mb-4">
                                <div class="col-md-6">
                                    <label for="birthday" class="form-label">วัน/เดือน/ปีเกิด <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control" id="dob" name="dob" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="phone" class="form-label">เบอร์โทรศัพท์ <span class="text-danger">*</span></label>
                                    <input type="tel" class="form-control" id="phone" name="phone" placeholder="0XXXXXXXXX" pattern="[0-9]{10}" required>
                                </div>
                            </div>

                            <div class="mb-4">
                                <label for="email" class="form-label">อีเมล <span class="text-danger">*</span></label>
                                <input type="email" class="form-control" id="email" name="email" required>
                            </div>
                            <div class="mb-4">
                                <label for="address" class="form-label">ที่อยู่ปัจจุบัน <span class="text-danger">*</span></label>
                                <textarea class="form-control" id="address" name="address" rows="3" required></textarea>
                            </div>


                            <h2 class="h5 mb-4 mt-5 border-bottom pb-2 text-primary">ประวัติการศึกษา</h2>
                            <div class="mb-4">
                                <label for="educationLevel" class="form-label">ระดับการศึกษาสูงสุด <span class="text-danger">*</span></label>
                                <select class="form-select" id="educationLevel" name="educationLevel" required>
                                    <option value="" selected disabled>--- กรุณาเลือกระดับการศึกษา ---</option>
                                    <option value="High School">มัธยมศึกษาตอนปลาย/ปวช.</option>
                                    <option value="Vocational">ปวส./อนุปริญญา</option>
                                    <option value="Bachelor">ปริญญาตรี</option>
                                    <option value="Master">ปริญญาโท</option>
                                    <option value="PhD">ปริญญาเอก</option>
                                </select>
                            </div>
                            <div class="row g-3 mb-4">
                                <div class="col-md-6">
                                    <label for="major" class="form-label">สาขาวิชาเอก</label>
                                    <input type="text" class="form-control" id="major" name="major">
                                </div>
                                <div class="col-md-6">
                                    <label for="university" class="form-label">สถาบัน/มหาวิทยาลัย</label>
                                    <input type="text" class="form-control" id="university" name="university">
                                </div>
                            </div>

                            <h2 class="h5 mb-4 mt-5 border-bottom pb-2 text-primary">ความสามารถพิเศษและประสบการณ์</h2>
                            
                            <div class="mb-4">
                                <label for="specialSkills" class="form-label">ความสามารถพิเศษ / ทักษะเฉพาะทาง</label>
                                <textarea class="form-control" id="specialSkills" name="specialSkills" rows="3" placeholder="เช่น ภาษา, โปรแกรม, เครื่องมือ, ใบรับรอง..."></textarea>
                            </div>
                            
                            <div class="mb-4">
                                <label for="workExperience" class="form-label">ประสบการณ์ทำงาน (สรุป)</label>
                                <textarea class="form-control" id="workExperience" name="workExperience" rows="4" placeholder="ระบุตำแหน่ง, ชื่อบริษัท, ระยะเวลาทำงาน และหน้าที่โดยสรุป..."></textarea>
                            </div>

                            <div class="row g-3 mb-4">
                                <div class="col-md-6">
                                    <label for="expectedSalary" class="form-label">เงินเดือนที่คาดหวัง (บาท)</label>
                                    <input type="number" class="form-control" id="expectedSalary" name="expectedSalary" placeholder="เช่น 30000">
                                </div>
                                <div class="col-md-6">
                                    <label for="startDate" class="form-label">วันที่พร้อมเริ่มงาน</label>
                                    <input type="date" class="form-control" id="startDate" name="startDate">
                                </div>
                            </div>
                            
                            <div class="d-grid">
                                <button type="submit" name="Submit" class="btn btn-success btn-lg">ส่งใบสมัคร</button>
                            </div>

                        </form>
                        
                        <?php
                        if (isset($_POST['Submit'])) {

                            include_once('connectdb.php');

                            $jobPosition = ($_POST['jobPosition'] == 'Other') 
                                ? $_POST['otherPosition'] 
                                : $_POST['jobPosition'];

                            $prefix = $_POST['prefix'];
                            $firstName = $_POST['firstName'];
                            $lastName = $_POST['lastName'];
                            $birthday = $_POST['dob']; // แก้ให้ตรง name
                            $phone = $_POST['phone'];
                            $email = $_POST['email'];
                            $address = $_POST['address'];
                            $educationLevel = $_POST['educationLevel'];
                            $major = $_POST['major'];
                            $university = $_POST['university'];
                            $specialSkills = $_POST['specialSkills'];
                            $workExperience = $_POST['workExperience'];
                            $expectedSalary = $_POST['expectedSalary'];
                            $startDate = $_POST['startDate'];

                            $sql = "INSERT INTO application 
                            (a_position, a_prefix, a_firstname, a_lastname, a_birthday, a_phone, a_email, a_address,
                            a_education, a_major, a_university, a_skills, a_experience, a_salary, a_startdate)
                            VALUES
                            ('$jobPosition', '$prefix', '$firstName', '$lastName', '$birthday', '$phone', '$email', '$address',
                            '$educationLevel', '$major', '$university', '$specialSkills', '$workExperience', '$expectedSalary', '$startDate')";

                            if (mysqli_query($conn, $sql)) {
                                echo "<script>alert('บันทึกข้อมูลสำเร็จ');</script>";
                            } else {
                                echo "<script>alert('เกิดข้อผิดพลาด');</script>";
                            }
                        }
                        ?>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

    <script>
        document.getElementById('jobPosition').addEventListener('change', function() {
            var otherField = document.getElementById('otherPositionField');
            if (this.value === 'Other') {
                otherField.style.display = 'block';
                document.getElementById('otherPosition').setAttribute('required', 'required');
            } else {
                otherField.style.display = 'none';
                document.getElementById('otherPosition').removeAttribute('required');
            }
        });
    </script>

</body>
</html>