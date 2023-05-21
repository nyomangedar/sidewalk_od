import cv2 as cv
from scipy import ndimage
class ImageRotation:
    dimension_y = (0, 4000)
    dimension_x = (0,1500,3000)
    left_image = None
    right_image = None
    image = None
    name=""
    def partition(self):
        self.left_image = self.image[self.dimension_y[0]:self.dimension_y[1], self.dimension_x[0]:self.dimension_x[1]]
        
        self.right_image = self.image[self.dimension_y[0]:self.dimension_y[1], self.dimension_x[1]:self.dimension_x[2]]
        
    def rotation(self):
        left_image= self.left_image
        right_image = self.right_image
        
        left_image = ndimage.rotate(left_image, 17.54)
        right_image = ndimage.rotate(right_image, -17.54)
        
        left_image = left_image[0:4000]
        cv.imwrite('./data/test_left.jpg', left_image)
        right_image = right_image[0:4000]
        cv.imwrite('./data/test_right.jpg', right_image)
        cv.imwrite('./data/test.jpg', self.image)
        
    
    def write_image(self):
        left_filename = self.name + '_left.jpg'
        right_filename = self.name + '_right.jpg'
        cv.imwrite('./data/test_left.jpg', self.left_image)
        
        
    
    def process_image(self):
        self.partition()
        self.rotation()

    def __init__(self, image_path, name):
        self.image = cv.imread(image_path)
        self.image = self.image[0:4000, 0:3000]
        self.name = name
    
    