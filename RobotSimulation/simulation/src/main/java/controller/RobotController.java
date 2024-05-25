package main.java.controller;

import javafx.scene.canvas.GraphicsContext;
import main.java.model.common.Environment;
import main.java.view.MainApp;
import main.java.view.ObstacleView;
import main.java.view.RobotView;
import main.java.model.common.Obstacle;
import main.java.model.common.Robot;
import main.java.model.room.AutonomousRobot;

import java.awt.Color;
import java.awt.event.KeyEvent;

/**
 * Controller class for the Robot
 */
public class RobotController {
    private Environment environment;
    private RobotView robotView;
    private ObstacleView obstacleView;
    private GraphicsContext gc;

    /**
     * Create a RobotController
     * @param environment the environment
     * @param robotView the robot view
     * @param obstacleView the obstacle view
     * @param gc the graphics context
     */
    public RobotController(Environment environment, RobotView robotView, ObstacleView obstacleView,
            GraphicsContext gc) {
        this.environment = environment;
        this.robotView = robotView;
        this.obstacleView = obstacleView;
        this.gc = gc;
    }

    /**
     * Update position of the robot
     */
    public void update() {

        // erase previous frame
        gc.setFill(javafx.scene.paint.Color.valueOf("A4B494"));

        gc.fillRect(0, 0, gc.getCanvas().getWidth(), gc.getCanvas().getHeight());

        for (Robot robot : environment.getRobots()) {
            if (robot instanceof AutonomousRobot) {
                robot.move();
            } else {
                if (MainApp.isKeyPressed(javafx.scene.input.KeyCode.W)) {
                    robot.move();
                }
                if (MainApp.isKeyPressed(javafx.scene.input.KeyCode.D)) {
                    robot.turn(1);
                }
                if (MainApp.isKeyPressed(javafx.scene.input.KeyCode.A)) {
                    robot.turn(-1);
                }
            }
            robotView.draw(robot, gc);
        }
        for (Obstacle obstacle : environment.getObstacles()) {
            obstacleView.draw(obstacle, gc);
        }

    }

    public void rewind_update(){
        // erase previous frame
        gc.setFill(javafx.scene.paint.Color.valueOf("A4B494"));

        gc.fillRect(0, 0, gc.getCanvas().getWidth(), gc.getCanvas().getHeight());

        for (Robot robot : environment.getRobots()) {
            robotView.draw(robot, gc);
        }
        for (Obstacle obstacle : environment.getObstacles()) {
            obstacleView.draw(obstacle, gc);
        }
    }

}
