class BoundingBoxProcessing:

    options = {'danger':True, 'alert': True, 'objectName': False, 'threshold':0.7}

    dist_200 = [[0,3000], [2000,2000]]
    
    center = [[1500,1500], [0,4000]]

    def right_line_funct(self, y):
        return (y + 9477.4)/6.14
    
    def left_line_funct(self, y):
        return (y - 7718.08)/-5.24
    
    center_line = center[0][0]
    
    # ALERT LINE
    left_line_rotated = 1846
    right_line_rotated = 790

    # DANGER LINE
    difference = 300
    d_left_line_rotated = left_line_rotated + difference
    d_right_line_rotated = right_line_rotated - difference

    def __init__(self, option):
        self.options = option


    # Evaluate x position with Left Line
    
    # EVALUATE LEFT LINE
    def evaluate_leftLine(self, x, y):
        # plug in y position to the function to find the correspond x coordinate:
        func_x = self.left_line_funct(y)
        if x < func_x:
            # Return False if object position is on the left side of left line
            return False
        else:
            # Return True if object position is on the right side of left line
            #  Which means that the object is inside the walking path
            return True
    
    def evaluate_leftLine_rotated(self, x):
        if x < self.left_line_rotated:
            return False
        else:
            return True
        
    def evaluate_d_leftLine_rotated(self, x):
        if x < self.d_left_line_rotated:
            return False
        else:
            return True

    # EVALUATE RIGHT LINE
    def evaluate_rightline(self, x, y):
        # plug in y position to the function to find the correspond x coordinate:
        func_x = self.right_line_funct(y)
        if x > func_x:
            # Return ... if object position is on the right side of right line
            return False
        else:
            # Return ... if object position is on the left side of right line
            #  Which means that the object is inside the walking path
            return True
    
    def evaluate_rightLine_rotated(self, x):
        if x > self.right_line_rotated:
            return False
        else:
            return True
    
    def evaluate_d_rightLine_rotated(self, x):
        if x > self.d_right_line_rotated:
            return False
        else:
            return True
    
    # EVALUATE CENTER
    def evaluate_centerLine(self, x_left, x_right):
        if x_left <= self.center_line and self.center_line <= x_right:
            return True
        return False


    def evaluate_distance(self, y):
        if y < self.dist_200[1][0]:
            return False
        else:
            return True

    def evaluate_side(self, x_left, x_right, y_bottom):
        center_line = self.center[0][0]
        # object is on the center:
        if x_left <= center_line <= x_right:
            return "Caution there's an obstacle ahead"
        # object is on the left side:
        if x_right < center_line or x_left < center_line:
            if self.evaluate_leftLine(x_right, y_bottom):
                return "Caution there's an obstacle on the left side ahead"
            return None
        # object is on the right side:
        if x_left > center_line or x_right > center_line:
            if self.evaluate_rightline(x_left, y_bottom):
                return "Caution there's an obstacle on the right side ahead"
            return None
    
    def evaluate_object_location(self, x_left, x_right, y_bottom):
        if self.evaluate_distance(y_bottom):
            return self.evaluate_side(x_left, x_right, y_bottom)
        else:
            return None
    
    # OUTDATED VERSION OF EVALUATING

    def detect(self, coordinates):
        answers = []
        for i in coordinates:
            x_left = int(i[0])
            x_right = int(i[0])+int(i[2])
            y_bottom = int(i[1])+int(i[3])
            potential_warning = self.evaluate_object_location(x_left, x_right, y_bottom)
            print(potential_warning)
            
            if potential_warning != None:
                answers.append(potential_warning)
        return answers
    
    # NEW VERSION OF EVALUATION
    
    # OLDER VERSION LONGER PROCESSING TIME
    def detect_rightSide_rotated(self, coordinates, answer):
        for i in coordinates:
            x_left = int(i[0])
            y_bottom = int(i[2])
            warning = self.evaluate_rightLine_rotated(x_left)
            if warning and y_bottom > 2000:
                answer.append("right")
                return
    
    def detect_leftSide_rotated(self, coordinates, answer):
        for i in coordinates:
            x_right = int(i[1])
            y_bottom = int(i[2])
            warning = self.evaluate_leftLine_rotated(x_right)
            if warning and y_bottom > 2000:
                answer.append("left")
                return
    
    def detect_center(self, coordinates, answer):
        center_line = self.center[0][0]
        for i in coordinates:
            x_left = int(i[0])
            x_right = int(i[1])
            y_bottom = int(i[2])
            if x_left <= center_line <= x_right and y_bottom > 2000:
                answer.append("center")
                return
            
    # NEWER VERSION
    def detect_rightSide_rotated_json(self, coordinates, alert, danger):
        for i in coordinates:
            x_left = i[0]
            y_bottom = i[2]
            obj_name = i[3]
            warning = self.evaluate_rightLine_rotated(x_left)
            danger_obs = self.evaluate_d_rightLine_rotated(x_left)
            if self.options['danger'] and danger_obs and y_bottom > 2000:
                danger.append(("right", obj_name))
                return
            if warning and y_bottom > 2000:
                alert.append(("right", obj_name))
                return
    
    def detect_leftSide_rotated_json(self, coordinates, alert, danger):
        for i in coordinates:
            x_right = i[1]
            y_bottom = i[2]
            obj_name = i[3]
            warning = self.evaluate_leftLine_rotated(x_right)
            danger_obs = self.evaluate_d_leftLine_rotated(x_right)
            if self.options['danger'] and danger_obs and y_bottom > 2000:
                danger.append(("left",obj_name))
                return
            if warning and y_bottom > 2000:
                alert.append(("left",obj_name))
                return
    
    def detect_center_json(self, coordinates, alert, danger):
        for i in coordinates:
            x_left = i[0]
            x_right = i[1]
            y_bottom = i[2]
            obj_name = i[3]
            print(x_left, x_right)
            danger_obs = self.evaluate_centerLine(x_left, x_right)
            print(danger_obs)
            if danger_obs and y_bottom > 2000:
                if self.options['danger']:
                    danger.append(("center", obj_name))
                else:
                    alert.append("center", obj_name)
                return  
    
    def detect_rotated(self, left_coordinates, right_coordinates, center_coordinates, option, json=False):
        alert = []
        danger = []
        object_name = self.options['objectName']
        if json:
            self.detect_center_json(center_coordinates,alert, danger)
            self.detect_leftSide_rotated_json(left_coordinates,alert, danger)
            self.detect_rightSide_rotated_json(right_coordinates,alert, danger)
        else: 
            self.detect_leftSide_rotated(left_coordinates,alert, danger)
            self.detect_rightSide_rotated(right_coordinates,alert, danger)
            self.detect_center(center_coordinates,alert, danger)
        ans = self.parsing_answer(danger=danger, alert=alert, object_name=object_name)
        return ans

    def parsing_answer(self, danger, alert, object_name=False):
        number_of_alert = len(alert)
        number_of_danger = len(danger)
        if object_name:
            alert_position = self.answer_with_name(alert)
            danger_position = self.answer_with_name(danger)
            if number_of_danger > 1:
                return f"Caution Dangerous obstacles of {danger_position} sides"
            if number_of_danger == 1:
                return f"Caution Dangerous {danger_position} side"
            if number_of_alert > 1:
                return f"There are {alert_position} sides"
            if number_of_alert == 1:
                return f"There is a {alert_position} side"
        else:
            
            alert_position = self.answer_without_name(alert)
            danger_position = self.answer_without_name(danger)
            if number_of_danger > 1:
                return f"Caution! angerous obstacles on your {danger_position} sides"
            if number_of_danger == 1:
                return f"Caution! A dangerous obstacle on your {danger_position} side"
            if number_of_alert > 1:
                return f"There are obstacles on your {alert_position} sides"
            if number_of_alert == 1:
                return f"There is an obstacle on your {alert_position} side"
            else:
                return 'none'
    
    def answer_without_name(self, list):
        ans = ""
        for i in range(len(list)):
            position = list[i][0]
            if i == len(list)-1:
                ans += position
            else:
                ans += position + ", and"
        return ans
    
    def answer_with_name(self, list):
        ans = ""
        for i in range(len(list)):
            position = list[i][0]
            object_name = list[i][1]
            if i == len(list)-1:
                ans += object_name + " on your " + position
            else:
                ans += object_name + " on your " + position + " and "
        return ans

    


            

    
    


        
