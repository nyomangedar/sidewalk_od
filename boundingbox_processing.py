class BoundingBoxProcessing:

    dist_200 = [[0,3000], [2000,2000]]
    
    center = [[1500,1500], [0,4000]]

    def right_line_funct(self, y):
        return (y + 9477.4)/6.14
    
    def left_line_funct(self, y):
        return (y - 7718.08)/-5.24


    # Evaluate x position with Left Line
    # x = left most coordinate
    # y = lowest coordinate
    def evaluate_leftLine(self, x, y):
        # plug in y position to the function to find the correspond x coordinate:
        func_x = self.left_line_funct(y)
        if x < func_x:
            # Return ... if object position is on the left side of left line
            return False
        else:
            # Return ... if object position is on the right side of left line
            #  Which means that the object is inside the walking path
            return True


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